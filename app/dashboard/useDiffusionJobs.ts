import type { DiffusionResult, Image, LogData } from "server/types";
import { sendJson } from "server/ws";
import { create } from "zustand";
interface JobWS {
  ws?: WebSocket | undefined;
  status: "idle" | "connected" | "closed";
  jobId: string;
  image?: Image;
  logs: Set<LogData>;

  connect: (
    onFetchImage: (loadMore: boolean) => void,
    onSetOutputTab: (dest: "image" | "console") => void,
  ) => void;
  setImage: (image: Image) => void;
  clearLogs: () => void;
  stop: (id: string) => void;
}

const checkActiveJobs = async (
  jobs: string[],
  onComplete: (id: string) => void,
) => {
  try {
    if (Array.isArray(jobs) && jobs.length > 0) {
      // Connect to the most recent job
      const lastJobId = jobs[jobs.length - 1];
      if (lastJobId) {
        onComplete(lastJobId);
      }
    }
  } catch (error) {
    console.error("Failed to check active jobs:", error);
  }
};

export const useDiffusionJobs = create<JobWS>((set, get) => ({
  status: "idle",
  jobId: "",
  logs: new Set(),

  connect: (
    onFetchImage: (loadMore: boolean) => void,
    onSetOutputTab: (dest: "image" | "console") => void,
  ) => {
    const ws = new WebSocket(`/ws`);
    set({ ws });

    function addLog(log: LogData) {
      set((state) => ({
        logs: new Set([...state.logs, log]),
      }));
    }

    function onEventLog(log: LogData) {
      try {
        addLog({
          message: log.message,
          type: log.type,
          timestamp: log.timestamp,
        });
      } catch (e) {
        console.error(e);
      }
    }

    function onEventComplete(result: DiffusionResult) {
      try {
        if (result.image && result.image.url.length > 0) {
          set({ image: result.image });
          onFetchImage(false);
        }
        set({ jobId: "" });
        onSetOutputTab("image");
      } catch (e) {
        console.error(e);
      }
    }

    function onEventError(error: DiffusionResult) {
      try {
        addLog({
          type: "stderr",
          timestamp: error.timestamp,
          message: error.message ?? "unknown error",
        });
      } catch (e) {
        console.error(e);
      }
      set({ jobId: "" });
    }

    ws.addEventListener(
      "message",
      (ev) => {
        const msg = JSON.parse(ev.data);
        switch (msg.type) {
          case "ping":
            console.log(`ws: ${ev.data}`);
            break;
          case "txt2img:start":
            set({ jobId: msg.data });
            break;
          case "jobId":
            set({ jobId: msg.data });
            break;
          case "jobs":
            checkActiveJobs(msg.data, (id: string) => {
              set({ jobId: id });
            });
            break;
          case "event":
            if (msg.event === "log") {
              onEventLog(msg.data);
            } else if (msg.event === "complete") {
              onEventComplete(msg.data);
            } else if (msg.event == "error") {
              onEventError(msg.data);
            }
            break;
          default:
            if (msg.error) {
              addLog({
                type: "stderr",
                message: msg.error,
                timestamp: msg.timestamp || Date.now(),
              });
            }
            break;
        }
      },
      { capture: true },
    );

    ws.addEventListener("open", () => {
      set({ status: "connected" });
      sendJson(ws, { action: "jobs" });
    });

    ws.addEventListener("close", () => {
      set({ status: "closed" });
    });
  },

  stop: (id: string) => {
    const ws = get().ws;
    sendJson(ws, { action: "txt2img:stop", data: id });
    set({ jobId: "" });
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: undefined, logs: new Set(), status: "idle" });
  },

  setImage: (image: Image) => {
    set({ image });
  },

  clearLogs: () => {
    set({ logs: new Set() });
  },
}));
