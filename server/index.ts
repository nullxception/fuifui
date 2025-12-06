import app from "app/index.html";
import serveStatic from "./api/assets";
import { removeBackground, uploadBackground } from "./api/background";
import { readConfig, saveConfig } from "./api/config";
import {
  diffusionJobs,
  diffusionModels,
  diffusionProgress,
  diffusionStart,
  diffusionStop,
} from "./api/diffusion";
import { listImages, removeImages } from "./api/gallery";
import system from "./api/system";
import { ensureDirectories } from "./dirs";
import { stopJobs } from "./services/jobs";

const PORT = process.env.PORT || 5141;

await ensureDirectories();

function cleanup() {
  console.log("Terminating all active jobs...");
  stopJobs();
  process.exit(0);
}

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

Bun.serve({
  port: PORT,
  idleTimeout: 0, // Disable timeout for long-running diffusion processes
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
  routes: {
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
    "/api/txt2img": { POST: diffusionStart },
    "/api/jobs/stop": { POST: diffusionStop },
    "/api/jobs/:id": diffusionProgress,
    "/api/jobs": diffusionJobs,
    // Serve static files from public directory (user-uploaded images)
    "/upload/*": serveStatic,
    // Serve output images
    "/output/*": serveStatic,
    "/*": app,
  },
});

console.log(`Server running at http://localhost:${PORT}`);
