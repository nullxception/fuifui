import { getJob, getLogs, withJobEvents } from "server/services/jobs";
import type { Job, LogEntry } from "server/types";

function streamJobProgress(
  controller: ReadableStreamDefaultController,
  job: Job,
  abortSignal: AbortSignal,
) {
  const encoder = new TextEncoder();
  const sendEvent = (event: string, data: unknown) => {
    try {
      data = typeof data === "string" ? data : JSON.stringify(data);
      controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
    } catch {
      // Controller might be closed
    }
  };

  // Send existing logs
  getLogs(job.id)?.forEach((log) => {
    sendEvent("message", log);
  });

  // Send current result/error if job is done
  if (job.result) {
    sendEvent(job.status === "completed" ? "complete" : "error", job.result);
  }

  // Subscribe to new logs
  const onLog = (log: LogEntry) => {
    if (log.jobId === job.id) {
      sendEvent("message", log);
    }
  };

  const onComplete = ({ id, data }: { id: string; data: string }) => {
    if (id === job.id) {
      sendEvent("complete", data);
    }
  };

  const onError = ({ id, data }: { id: string; data: string }) => {
    if (id === job.id) {
      sendEvent("error", data);
    }
  };

  withJobEvents((events) => {
    events.on("log", onLog);
    events.on("complete", onComplete);
    events.on("error", onError);

    // Cleanup on close
    abortSignal.addEventListener("abort", () => {
      events.off("log", onLog);
      events.off("complete", onComplete);
      events.off("error", onError);
      try {
        controller.close();
      } catch {
        // Ignore
      }
    });
  });
}

export const serveJobProgress: Bun.Serve.Handler<
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

  return new Response(
    new ReadableStream({
      start: (controller) => streamJobProgress(controller, job, req.signal),
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    },
  );
};
