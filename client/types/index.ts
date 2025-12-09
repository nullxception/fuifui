export interface LogEntry {
  type: "stdout" | "stderr";
  message: string;
  timestamp?: number;
}
