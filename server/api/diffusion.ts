import { promises as fs } from "fs";
import { EMBEDDING_DIR, LORA_DIR, MODEL_DIR, VAE_DIR } from "../constants";
import type { DiffusionParams, Models } from "../types";
import { startDiffusion, stopDiffusion } from "./services/diffusion";
import { createJob, getActiveJobs, getJob, jobEvents } from "./services/jobs";

const getFileList = async (dir: string): Promise<string[]> => {
  const files = await fs.readdir(dir);
  return files.filter((file) => file !== "placeholder");
};

export const diffusionModels = async () => {
  try {
    return Response.json(<Models>{
      checkpoints: await getFileList(MODEL_DIR),
      embeddings: await getFileList(EMBEDDING_DIR),
      loras: await getFileList(LORA_DIR),
      vaes: await getFileList(VAE_DIR),
    });
  } catch (error) {
    console.error("Error reading models directory:", error);
    return Response.json({ error: "Failed to list models" }, { status: 500 });
  }
};

export const diffusionStart = async (req: Request) => {
  try {
    const body = (await req.json()) as DiffusionParams;

    if (!body.model) {
      return Response.json({ error: "Model is required" }, { status: 400 });
    }

    const job = createJob(body);
    startDiffusion(job.id, body);

    return Response.json({ jobId: job.id });
  } catch (error) {
    console.error("Error parsing request body:", error);
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
};

export const diffusionStop = async (req: Request) => {
  const { jobId } = await req.json();
  const job = getJob(jobId);

  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  if (stopDiffusion(jobId)) {
    return Response.json({
      success: true,
      message: "Diffusion stopped",
    });
  } else {
    return Response.json(
      { error: "No diffusion process running" },
      { status: 400 },
    );
  }
};

export const diffusionProgress: Bun.Serve.Handler<
  Bun.BunRequest<"/api/progress/:id">,
  Bun.Server<undefined>,
  Response
> = async (req: Bun.BunRequest<"/api/progress/:id">) => {
  const jobId = req.params.id;

  if (!jobId) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  const job = getJob(jobId);
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {
          // Controller might be closed
        }
      };

      // Send existing logs
      job.logs.forEach((log) => {
        sendEvent("message", log);
      });

      // Send current result/error if job is done
      if (job.result) {
        sendEvent("complete", job.result);
      } else if (job.error) {
        sendEvent("error", job.error);
      }

      // Subscribe to new logs
      const onLog = ({ jobId: id, log }: { jobId: string; log: unknown }) => {
        if (id === jobId) {
          sendEvent("message", log);
        }
      };

      const onComplete = ({
        jobId: id,
        result,
      }: {
        jobId: string;
        result: unknown;
      }) => {
        if (id === jobId) {
          sendEvent("complete", result);
        }
      };

      const onError = ({
        jobId: id,
        error,
      }: {
        jobId: string;
        error: unknown;
      }) => {
        if (id === jobId) {
          sendEvent("error", error);
        }
      };

      jobEvents.on("log", onLog);
      jobEvents.on("complete", onComplete);
      jobEvents.on("error", onError);

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        jobEvents.off("log", onLog);
        jobEvents.off("complete", onComplete);
        jobEvents.off("error", onError);
        try {
          controller.close();
        } catch {
          // Ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
};

export const diffusionJobs = async () => {
  const jobs = getActiveJobs().map((job) => job.id);
  return Response.json(jobs);
};
