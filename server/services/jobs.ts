import { randomUUIDv7, type Subprocess } from "bun";
import { EventEmitter } from "events";
import type { DiffusionResult, Job, JobStatus, LogData } from "server/types";

const jobEvents = new EventEmitter();
const activeProcesses = new Map<string, Subprocess>();
const jobs = new Map<string, Job>();

export function createJob(id?: string) {
  const job: Job = {
    id: id ?? randomUUIDv7(),
    status: "pending",
    createdAt: Date.now(),
    logs: [],
  };

  jobs.set(job.id, job);
  return job;
}

export const getJob = (id: string) => jobs.get(id);

export const withJobEvents = (predicate: (events: EventEmitter) => void) =>
  predicate(jobEvents);

export function updateJobStatus({
  id,
  status,
  process = null,
  data,
}: {
  id: string;
  status: JobStatus;
  process?: Subprocess | null;
  data?: DiffusionResult;
}) {
  const job = jobs.get(id);

  if (job) {
    job.status = status;
    if (status === "running" && !job.startedAt) {
      job.startedAt = Date.now();
    } else if (
      ["completed", "failed", "cancelled"].includes(status) &&
      !job.completedAt
    ) {
      job.completedAt = Date.now();
    }
    if (status === "completed") {
      job.result = data;
      jobEvents.emit("complete", { jobId: id, data });
    } else if (status === "failed") {
      job.result = data;
      jobEvents.emit("error", { jobId: id, data });
    }
  }

  if (status === "running" && process) {
    activeProcesses.set(id, process);
  }

  if (["completed", "failed", "cancelled"].includes(status)) {
    const process = activeProcesses.get(id);
    if (process) {
      if (!process.killed) {
        console.log(`closing job ${id}`);
        process.kill();
        process.kill("SIGTERM");
        process.kill("SIGKILL");
      }
      activeProcesses.delete(id);
    }
  }
  if (job && status === "cancelled") {
    job.result = {
      message: `Job ${id} has been cancelled`,
    };
    jobEvents.emit("error", { jobId: id, data: job.result });
  }
}

export function addJobLog(id: string, log: LogData) {
  let job = jobs.get(id);
  if (!job) {
    job = createJob(id);
  }

  job?.logs.push(log);
  jobEvents.emit("log", { jobId: id, log });
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values());
}

export function deleteJobByResultFile(filename: string) {
  for (const [id, job] of jobs.entries()) {
    if (job.result?.image?.url === filename) {
      jobs.delete(id);
    }
  }
}

export function stopJob(jobId?: string) {
  if (jobId) {
    updateJobStatus({ id: jobId, status: "cancelled" });
  }
}

export function stopJobs() {
  for (const [id] of activeProcesses.entries()) {
    stopJob(id);
  }
}
export function cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (job.completedAt && now - job.completedAt > maxAge) {
      jobs.delete(id);
    }
  }
}
