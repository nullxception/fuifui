import type { LogEntry } from "@/types";
import type {
  DiffusionParams,
  DiffusionResult,
  Image,
  LogData,
} from "server/types";
import { create } from "zustand";
import { useGallery } from "../gallery/useGallery";
import { useAppStore } from "../stores/useAppStore";

interface DiffusionState {
  jobId: string;
  isProcessing: boolean;
  image: Image | null;
  logs: LogEntry[];

  setImage: (image: Image | null) => void;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  connectToJob: (id: string) => void;
  start: (params: DiffusionParams) => Promise<void>;
  stop: () => Promise<void>;
  checkActiveJobs: () => Promise<void>;
}

let eventSource: EventSource | null = null;

export const useDiffusionJob = create<DiffusionState>((set, get) => ({
  jobId: "",
  isProcessing: false,
  image: null,
  logs: [],

  setImage: (image) => set({ image: image }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
  connectToJob: (id: string) => {
    if (eventSource) {
      eventSource.close();
    }

    const es = new EventSource(`/api/jobs/${id}`);
    eventSource = es;

    set({ jobId: id, isProcessing: true });

    const { addLog, setImage } = get();
    const { setOutputTab } = useAppStore.getState();
    const { fetchImages } = useGallery.getState();

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
        if (result.image && result.image.url.length > 0) {
          setImage(result.image);
          fetchImages(false);
        }
        es.close();
        eventSource = null;
        set({ jobId: "", isProcessing: false });
        setOutputTab("image");
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
    get().clearLogs();

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
      get().connectToJob(resp.jobId);
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

  checkActiveJobs: async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const jobs = await response.json();
        if (Array.isArray(jobs) && jobs.length > 0) {
          const lastJobId = jobs[jobs.length - 1];
          get().connectToJob(lastJobId);
        }
      }
    } catch (error) {
      console.error("Failed to check active jobs:", error);
    }
  },
}));
