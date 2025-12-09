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
  jobStatus: (type: JobType) => JobStatus | undefined;
  setPreviewImage: (image?: Image) => void;
  setError: (jobId: string, type: JobType, message: string) => void;
  postResult: (jobId: string, type: JobType, result: Image | string) => void;
  addLog: (log: LogEntry) => void;
  connectToJob: (id: string, type: JobType) => void;
  checkJobs: (jobs: Partial<Job>[]) => Promise<void>;
}

let eventSource: EventSource | null = null;
const TO_BE_FILLED = "to-be-filled";

export const useJobs = create<JobsState>((set, get) => ({
  jobs: new Map<JobType, JobStatus>(),
  logs: [],
  jobStatus(type) {
    return get().jobs.get(type);
  },
  setPreviewImage: (image) => {
    set((state) => ({
      jobs: new Map(state.jobs).set("txt2img", {
        image,
        id: TO_BE_FILLED,
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
  setError(jobId, type, message) {
    const { addLog } = get();
    addLog({
      jobId,
      type: "stderr",
      message: message,
    });
    set((state) => ({
      jobs: new Map(state.jobs).set(type, {
        id: jobId,
        isProcessing: false,
      }),
    }));
  },
  connectToJob: (jobId, type) => {
    if (eventSource) {
      eventSource.close();
    }
    set((state) => ({
      jobs: new Map(state.jobs).set(type, {
        id: jobId,
        isProcessing: true,
      }),
      logs: [],
    }));
    const es = new EventSource(`/api/jobs/${jobId}`);
    const { addLog, postResult } = get();
    const { setOutputTab } = useAppStore.getState();
    eventSource = es;
    setOutputTab("console");
    console.log(JSON.stringify(get().jobs));

    const close = (es: EventSource) => {
      es.close();
      eventSource = null;
      set((state) => ({
        jobs: new Map(state.jobs).set(type, {
          id: jobId,
          isProcessing: false,
        }),
      }));
    };

    let onClosing: Disposable;

    es.onmessage = (event) => {
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
    };

    es.addEventListener("complete", (event) => {
      try {
        const result = JSON.parse(event.data);
        postResult(jobId, type, result);
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
      const willBeFilled = jobStatus("txt2img")?.id === TO_BE_FILLED;

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
