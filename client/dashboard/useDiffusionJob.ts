import type { LogEntry } from "client/types";
import type { DiffusionResult, Image, Job, LogData } from "server/types";
import { create } from "zustand";
import { useAppStore } from "../stores/useAppStore";

interface DiffusionState {
  jobId: string;
  isProcessing: boolean;
  image?: Image;
  logs: LogEntry[];

  setImage: (image?: Image) => void;
  setError: (message: string) => void;
  postResult: (result: DiffusionResult) => void;
  addLog: (log: LogEntry) => void;
  connectToJob: (id: string) => void;
  checkJobs: (jobs: Partial<Job>[]) => Promise<void>;
}

let eventSource: EventSource | null = null;

export const useDiffusionJob = create<DiffusionState>((set, get) => ({
  jobId: "",
  isProcessing: false,
  image: undefined,
  logs: [],

  setImage: (image) => set({ image: image }),
  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, { ...log, timestamp: Date.now() }],
    })),
  postResult: (result) => {
    const { setOutputTab } = useAppStore.getState();
    set({ image: result.image, jobId: "", isProcessing: false });
    setOutputTab("image");
  },
  setError(message: string) {
    get().addLog({
      type: "stderr",
      message: message,
    });
    set({ jobId: "", isProcessing: false });
  },
  connectToJob: (id: string) => {
    if (eventSource) {
      eventSource.close();
    }

    const es = new EventSource(`/api/jobs/${id}`);
    const { addLog, postResult } = get();
    const { setOutputTab } = useAppStore.getState();
    eventSource = es;
    set({ jobId: id, isProcessing: true, logs: [] });
    setOutputTab("console");

    const close = (es: EventSource) => {
      es.close();
      eventSource = null;
      set({ jobId: "", isProcessing: false });
    };

    let onClosing: Disposable;

    es.onmessage = (event) => {
      try {
        const log: LogData = JSON.parse(event.data);
        addLog({
          message: log.message,
          type: log.type,
        });
      } catch (e) {
        console.error(e);
      }
    };

    es.addEventListener("complete", (event) => {
      try {
        const result: DiffusionResult = JSON.parse(event.data);
        postResult(result);
        es.close();
        eventSource = null;
      } catch (e) {
        console.error(e);
      }
    });

    es.addEventListener("error", (event) => {
      try {
        const ev = event as MessageEvent;
        if (ev.data) {
          const result: DiffusionResult = JSON.parse(ev.data);
          if (result.message) {
            addLog({
              type: "stderr",
              message: result.message,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
      if (!onClosing) {
        onClosing = setTimeout(() => close(es), 500);
      }
    });
  },
  checkJobs: async (jobs: Partial<Job>[]) => {
    try {
      const { connectToJob, postResult } = get();

      if (jobs.length == 0) return;

      const last = jobs[jobs.length - 1];
      if (!last) return;

      const isRunning = last.status === "pending" || last.status === "running";
      if (last.id && isRunning) {
        connectToJob(last.id);
      } else if (last.status === "completed" && last.result) {
        postResult(last.result);
      }
    } catch (error) {
      console.error("Failed to check active jobs:", error);
    }
  },
}));
