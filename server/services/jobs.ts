import { randomUUIDv7, type Subprocess } from "bun";
import { EventEmitter } from "events";
import type { DiffusionResult, Job, JobStatus, LogData } from "../types";

export const jobEvents = new EventEmitter();
export const activeProcesses = new Map<string, Subprocess>();
const jobs = new Map<string, Job>();

export const createJob = (id?: string): Job => {
  const job: Job = {
    id: id ?? randomUUIDv7(),
    status: "pending",
    createdAt: Date.now(),
    logs: [],
  };

  jobs.set(job.id, job);
  return job;
};

export const getJob = (id: string): Job | undefined => {
  return jobs.get(id);
};

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
      error: "cancelled",
      message: `Job ${id} has been cancelled`,
    };
    jobEvents.emit("error", { jobId: id, data: job.result });
  }
}

export const addJobLog = (id: string, log: LogData): void => {
  let job = jobs.get(id);
  if (!job) {
    job = createJob(id);
  }

  job?.logs.push(log);
  jobEvents.emit("log", { jobId: id, log });
};

export const getAllJobs = (): Job[] => {
  return Array.from(jobs.values());
};

export const deleteJobByResultFile = (filename: string): void => {
  for (const [id, job] of jobs.entries()) {
    if (job.result?.image?.url === filename) {
      jobs.delete(id);
    }
  }
};

export const cleanupOldJobs = (maxAge: number = 24 * 60 * 60 * 1000): void => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (job.completedAt && now - job.completedAt > maxAge) {
      jobs.delete(id);
    }
  }
};
