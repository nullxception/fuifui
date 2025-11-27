import { randomUUIDv7 } from "bun";
import { EventEmitter } from "events";
import type {
  DiffusionComplete,
  DiffusionError,
  DiffusionParams,
  Job,
  JobStatus,
  LogData,
} from "../../types/index";

export const jobEvents = new EventEmitter();

const jobs = new Map<string, Job>();

export const createJob = (params: DiffusionParams): Job => {
  const job: Job = {
    id: randomUUIDv7(),
    status: "pending",
    params,
    createdAt: Date.now(),
    logs: [],
  };

  jobs.set(job.id, job);
  return job;
};

export const getJob = (id: string): Job | undefined => {
  return jobs.get(id);
};

export const updateJobStatus = (id: string, status: JobStatus): void => {
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
  }
};

export const setJobResult = (id: string, result: DiffusionComplete): void => {
  const job = jobs.get(id);
  if (job) {
    job.result = result;
    job.status = "completed";
    job.completedAt = Date.now();
    jobEvents.emit("complete", { jobId: id, result });
  }
};

export const setJobError = (id: string, error: DiffusionError): void => {
  const job = jobs.get(id);
  if (job) {
    job.error = error;
    job.status = "failed";
    job.completedAt = Date.now();
    jobEvents.emit("error", { jobId: id, error });
  }
};

export const addJobLog = (id: string, log: LogData): void => {
  const job = jobs.get(id);
  if (job) {
    job.logs.push(log);
    jobEvents.emit("log", { jobId: id, log });
  }
};

export const deleteJob = (id: string): boolean => {
  return jobs.delete(id);
};

export const getAllJobs = (): Job[] => {
  return Array.from(jobs.values());
};

export const getActiveJobs = (): Job[] => {
  return Array.from(jobs.values()).filter(
    (job) => job.status === "pending" || job.status === "running",
  );
};

export const cleanupOldJobs = (maxAge: number = 24 * 60 * 60 * 1000): void => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (job.completedAt && now - job.completedAt > maxAge) {
      jobs.delete(id);
    }
  }
};
