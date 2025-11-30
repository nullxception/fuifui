import app from "public/index.html";
import serveStatic from "./api/assets";
import { removeBackground, uploadBackground } from "./api/background";
import { readConfig, saveConfig } from "./api/config";
import {
  diffusionModels,
  diffusionProgress,
  diffusionStart,
  diffusionStop,
} from "./api/diffusion";
import { listImages, removeImages } from "./api/gallery";
import { stopDiffusion } from "./api/services/diffusion";
import { getActiveJobs } from "./api/services/jobs";
import system from "./api/system";
import { ensureDirectories } from "./dirs";
import { sendJson } from "./ws";

const PORT = process.env.PORT || 5141;

await ensureDirectories();

const cleanup = () => {
  console.log("Terminating all active jobs...");
  stopDiffusion();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("SIGQUIT", cleanup);
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  cleanup();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  cleanup();
});

const server = Bun.serve({
  port: PORT,
  idleTimeout: 0, // Disable timeout for long-running diffusion processes
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
  websocket: {
    open(ws) {
      console.log("client connected");
      sendJson(ws, { type: "status", state: "connected" });
      diffusionProgress(ws);
    },

    message(ws, message) {
      console.log("message: " + message);
      try {
        const data = JSON.parse(message as string);
        switch (data.action) {
          case "txt2img:start":
            diffusionStart(ws, data.data);
            break;
          case "jobs":
            sendJson(ws, {
              type: "jobs",
              data: getActiveJobs().map((job) => job.id),
            });
            break;
          case "txt2img:stop":
            diffusionStop(ws, data.data);
            break;
          default:
            sendJson(ws, { type: "ping", state: message });
            break;
        }
      } catch (error) {
        console.error("cannot process message: " + error);
      }
    },

    close(ws) {
      if (ws) {
        console.log("client disconnected");
      }
    },
  },
  routes: {
    "/ws": (req) => {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    "/api/health": Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    }),
    "/api/system-info": system.info,
    "/api/config": { GET: readConfig, POST: saveConfig },
    "/api/config/background": {
      POST: uploadBackground,
      DELETE: removeBackground,
    },
    "/api/images": { GET: listImages, DELETE: removeImages },
    "/api/models": diffusionModels,
    // Serve static files from public directory (user-uploaded images)
    "/upload/*": serveStatic,
    // Serve output images
    "/output/*": serveStatic,
    "/*": app,
  },
});

console.log(`Server running at http://localhost:${server.port}`);
