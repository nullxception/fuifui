import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface LogEntry {
  type: "stdout" | "stderr";
  message: string;
  timestamp: number;
}

interface DiffusionState {
  imageUrl: string | null;
  logs: LogEntry[];

  setImageUrl: (url: string | null) => void;
  setLogs: (logs: LogEntry[]) => void;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  reset: () => void;
}

export const useDiffusionStatus = create<DiffusionState>()(
  subscribeWithSelector((set) => ({
    imageUrl: null,
    logs: [],

    setImageUrl: (url) => set({ imageUrl: url }),
    setLogs: (logs) => set({ logs }),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    clearLogs: () => set({ logs: [] }),
    reset: () => set({ imageUrl: null, logs: [] }),
  })),
);
