import type { LogEntry } from "client/types";
import type { Image, Job, LogData } from "server/types";
import type { JobType } from "server/types/jobs";
import { create } from "zustand";
import { useAppStore } from "./useAppStore";

interface JobStatus {
  id: string;
  isProcessing: boolean;
  image?: Image;
}

interface JobsState {
  jobs: Map<JobType, JobStatus>;
  logs: LogEntry[];
  eventSource: EventSource | null;
  jobStatus: (type: JobType) => JobStatus | undefined;
  setPreviewImage: (image?: Image) => void;
  setError: (type: JobType, message: string) => void;
  postResult: (jobId: string, type: JobType, result: Image | string) => void;
  addLog: (log: LogEntry) => void;
  connectToJob: (id: string, type: JobType) => void;
  checkJobs: (jobs: Partial<Job>[]) => Promise<void>;
}

export const useJobs = create<JobsState>((set, get) => ({
  jobs: new Map<JobType, JobStatus>(),
  logs: [],
  eventSource: null,
  jobStatus(type) {
    return get().jobs.get(type);
  },
  setPreviewImage: (image) => {
    set((state) => ({
      jobs: new Map(state.jobs).set("txt2img", {
        image,
        id: "",
        isProcessing: false,
      }),
    }));
  },
  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, { ...log, timestamp: Date.now() }],
    })),
  postResult: (jobId, type, result) => {
    if (typeof result === "string") {
      set((state) => ({
        jobs: new Map(state.jobs).set(type, {
          id: jobId,
          isProcessing: false,
        }),
      }));
      return;
    }

    const { setOutputTab } = useAppStore.getState();
    set((state) => ({
      jobs: new Map(state.jobs).set(type, {
        id: jobId,
        image: result,
        isProcessing: false,
      }),
    }));
    setOutputTab("image");
  },
  setError(type, message) {
    const { jobStatus, addLog } = get();
    const id = jobStatus(type)?.id ?? "";
    addLog({
      type: "stderr",
      message: message,
      jobId: id,
    });
    set((state) => ({
      jobs: new Map(state.jobs).set(type, {
        id: id,
        isProcessing: false,
      }),
    }));
  },
  connectToJob: (jobId, type) => {
    const { eventSource } = get();
    const { addLog, postResult } = get();
    const { setOutputTab } = useAppStore.getState();
    if (eventSource) {
      eventSource.close();
    }

    const es = new EventSource(`/api/jobs/${jobId}`);
    const close = (es: EventSource) => {
      es.close();
      set((state) => ({
        jobs: new Map(state.jobs).set(type, {
          id: jobId,
          isProcessing: false,
        }),
        eventSource: null,
      }));
    };

    let onClosing: Disposable;
    es.addEventListener("open", () => {
      set((state) => ({
        jobs: new Map(state.jobs).set(type, {
          id: jobId,
          isProcessing: true,
        }),
        logs: [],
        eventSource: es,
      }));
      setOutputTab("console");
    });

    es.addEventListener("message", (event) => {
      try {
        const log: LogData = JSON.parse(event.data);
        addLog({
          jobId: jobId,
          message: log.message,
          type: log.type,
        });
      } catch (e) {
        console.error(e);
      }
    });
    es.addEventListener("complete", (event) => {
      try {
        const result = JSON.parse(event.data);
        postResult(jobId, type, result);
        es.close();
        set({ eventSource: es });
      } catch (e) {
        console.error(e);
      }
    });

    es.addEventListener("error", (event) => {
      try {
        const ev = event as MessageEvent;
        if (ev.data) {
          const result = JSON.parse(ev.data);
          if (result) {
            addLog({
              jobId: jobId,
              type: "stderr",
              message: result,
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
      const { connectToJob, postResult, jobStatus } = get();
      const willBeFilled = jobStatus("txt2img")?.id === "";

      if (jobs.length == 0 || willBeFilled) return;

      const last = jobs[jobs.length - 1];
      if (!last) return;

      const isRunning = last.status === "pending" || last.status === "running";

      if (last.id && last.type && isRunning) {
        connectToJob(last.id, last.type);
      } else if (
        last.status === "completed" &&
        last.result &&
        last.id &&
        last.type
      ) {
        postResult(last.id, last.type, last.result);
      }
    } catch (error) {
      console.error("Failed to check active jobs:", error);
    }
  },
}));
