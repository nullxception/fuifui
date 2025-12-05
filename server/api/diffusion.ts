import { promises as fs } from "fs";
import path from "path";
import {
  CHECKPOINT_DIR,
  EMBEDDING_DIR,
  LLM_DIR,
  LORA_DIR,
  TEXT_ENCODER_DIR,
  UPSCALER_DIR,
  VAE_DIR,
} from "../dirs";
import { startDiffusion, stopDiffusion } from "../services/diffusion";
import { createJob, getAllJobs, getJob, jobEvents } from "../services/jobs";
import type { DiffusionParams, DiffusionResult, Models } from "../types";

const getFileList = async (
  dir: string,
  recursive: boolean = true,
): Promise<string[]> => {
  const files = await fs.readdir(dir, {
    recursive: recursive,
    withFileTypes: true,
  });
  return files
    .filter((it) => !/.placeholder$/.test(it.name) && it.isFile())
    .map((it) => path.relative(dir, path.join(it.parentPath, it.name)));
};

export const diffusionModels = async () => {
  try {
    return Response.json(<Models>{
      checkpoints: await getFileList(CHECKPOINT_DIR),
      embeddings: await getFileList(EMBEDDING_DIR, false),
      loras: await getFileList(LORA_DIR),
      vaes: await getFileList(VAE_DIR),
      upscalers: await getFileList(UPSCALER_DIR),
      llms: await getFileList(LLM_DIR),
      textEncoders: await getFileList(TEXT_ENCODER_DIR),
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

    const job = createJob();
    startDiffusion(job.id, body);

    return Response.json({ jobId: job.id });
  } catch (error) {
    console.error("Error parsing request body:", error);
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
};

export const diffusionStop = async (req: Request) => {
  const { jobId } = await req.json();

  stopDiffusion(jobId);
  return Response.json({
    success: true,
    message: "Diffusion stopped",
  });
};

export const diffusionProgress: Bun.Serve.Handler<
  Bun.BunRequest<"/api/jobs/:id">,
  Bun.Server<undefined>,
  Response
> = async (req: Bun.BunRequest<"/api/jobs/:id">) => {
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
        sendEvent(
          Object.keys(job.result).includes("success") ? "completed" : "error",
          job.result,
        );
      }

      // Subscribe to new logs
      const onLog = ({ jobId: id, log }: { jobId: string; log: unknown }) => {
        if (id === jobId) {
          sendEvent("message", log);
        }
      };

      const onComplete = ({
        jobId: id,
        data,
      }: {
        jobId: string;
        data: DiffusionResult;
      }) => {
        if (id === jobId) {
          sendEvent("complete", data);
        }
      };

      const onError = ({
        jobId: id,
        data,
      }: {
        jobId: string;
        data: DiffusionResult;
      }) => {
        if (id === jobId) {
          sendEvent("error", data);
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
  const jobs = getAllJobs().map((job) => ({ ...job, logs: [], params: {} }));
  return Response.json(jobs);
};
