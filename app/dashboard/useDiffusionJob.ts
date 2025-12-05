import type { LogEntry } from "@/types";
import type {
  DiffusionParams,
  DiffusionResult,
  Image,
  Job,
  LogData,
} from "server/types";
import { create } from "zustand";
import { useGallery } from "../gallery/useGallery";
import { useAppStore } from "../stores/useAppStore";

interface DiffusionState {
  jobId: string;
  isProcessing: boolean;
  image?: Image;
  logs: LogEntry[];

  setImage: (image?: Image) => void;
  postResult: (result: DiffusionResult) => void;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  connectToJob: (id: string) => void;
  start: (params: DiffusionParams) => Promise<void>;
  stop: () => Promise<void>;
  checkJobs: () => Promise<void>;
}

let eventSource: EventSource | null = null;

export const useDiffusionJob = create<DiffusionState>((set, get) => ({
  jobId: "",
  isProcessing: false,
  image: undefined,
  logs: [],

  setImage: (image) => set({ image: image }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
  postResult: (result) => {
    const { setOutputTab } = useAppStore.getState();
    const { images, appendImage } = useGallery.getState();
    const newImage = result.image;
    if (newImage) {
      set({ image: newImage });
      if (!images.find((x) => x.url === newImage.url)) {
        appendImage(newImage);
      }
    }
    set({ jobId: "", isProcessing: false });
    setOutputTab("image");
  },
  connectToJob: (id: string) => {
    if (eventSource) {
      eventSource.close();
    }

    const es = new EventSource(`/api/jobs/${id}`);
    const { addLog, postResult } = get();
    const { setOutputTab } = useAppStore.getState();
    eventSource = es;
    set({ jobId: id, isProcessing: true });
    setOutputTab("console");

    es.onmessage = (event) => {
      try {
        const log: LogData = JSON.parse(event.data);
        addLog({
          message: log.message,
          type: log.type,
          timestamp: event.timeStamp,
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
          const error: DiffusionResult = JSON.parse(ev.data);
          addLog({
            type: "stderr",
            timestamp: Date.now(),
            message: error.message ?? "unknown error",
          });
        }
      } catch (e) {
        console.error(e);
      }
      es.close();
      eventSource = null;
      set({ jobId: "", isProcessing: false });
    });

    es.onerror = () => {
      es.close();
      eventSource = null;
      set({ jobId: "", isProcessing: false });
    };
  },

  start: async (params: DiffusionParams) => {
    const { connectToJob, clearLogs } = get();
    clearLogs();

    try {
      const response = await fetch("/api/txt2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to create job: ${response.statusText}`);
      }

      const resp = await response.json();
      connectToJob(resp.jobId);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Check console for details.");
      set({ jobId: "", isProcessing: false });
    }
  },

  stop: async () => {
    const { jobId } = get();
    if (!jobId) return;

    try {
      await fetch(`/api/jobs/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });
    } catch (error) {
      console.error("Error stopping diffusion:", error);
    }
  },

  checkJobs: async () => {
    try {
      const { connectToJob, postResult } = get();
      const response = await fetch("/api/jobs");
      if (!response.ok) return;

      const jobs: Partial<Job>[] = await response.json();
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
