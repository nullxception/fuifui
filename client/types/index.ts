export interface LogEntry {
  type: "stdout" | "stderr";
  message: string;
  jobId: string;
  timestamp?: number;
}
