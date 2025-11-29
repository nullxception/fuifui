import type { LogEntry } from "@/types";
import type { Image } from "server/types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
interface DiffusionState {
  image: Image | null;
  logs: LogEntry[];

  setImage: (image: Image | null) => void;
  setLogs: (logs: LogEntry[]) => void;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  reset: () => void;
}

export const useDiffusionStatus = create<DiffusionState>()(
  subscribeWithSelector((set) => ({
    image: null,
    logs: [],

    setImage: (image) => set({ image: image }),
    setLogs: (logs) => set({ logs }),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    clearLogs: () => set({ logs: [] }),
    reset: () => set({ image: null, logs: [] }),
  })),
);
