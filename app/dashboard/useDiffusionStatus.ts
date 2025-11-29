import type { LogEntry } from "@/types";
import type { Image } from "server/types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
interface DiffusionState {
  image: Image | null;
  logs: LogEntry[];

  setImage: (image: Image | null) => void;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
}

export const useDiffusionStatus = create<DiffusionState>()(
  subscribeWithSelector((set) => ({
    image: null,
    logs: [],

    setImage: (image) => set({ image: image }),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    clearLogs: () => set({ logs: [] }),
  })),
);
