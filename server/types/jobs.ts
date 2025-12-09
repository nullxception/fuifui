import z from "zod";
import type { Image } from "./image";

export const jobsTypeSchema = z.literal(["txt2img", "convert"]);
export type JobType = z.infer<typeof jobsTypeSchema>;
export type JobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface Job {
  id: string;
  status: JobStatus;
  type: JobType;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: Image | string;
  logs: LogData[];
}

export interface LogData {
  type: "stdout" | "stderr";
  message: string;
}
