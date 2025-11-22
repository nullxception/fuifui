import {
  createDiffusionStream,
  stopDiffusion,
} from "../services/diffusionService";
import {
  listImages,
  processBackgroundImage,
  deleteBackgroundImage,
} from "../services/imageService";
import { readConfig, saveConfig } from "../services/configService";
import { jsonResponse } from "../middleware/response";
import { createJob, getJob } from "../services/jobService";
import { getModelfiles } from "./api";
import {
  MODEL_DIR,
  EMBEDDING_DIR,
  LORA_DIR,
  VAE_DIR,
} from "../config/constants";
import type { DiffusionParams } from "../types/index";

export const apiRoutes: Record<
  string,
  (request?: Request) => Promise<Response>
> = {
  "GET:/api/health": async () => {
    return jsonResponse({ status: "ok", timestamp: new Date().toISOString() });
  },
  "GET:/api/models": async () => await getModelfiles(MODEL_DIR),
  "GET:/api/embeddings": async () => await getModelfiles(EMBEDDING_DIR),
  "GET:/api/loras": async () => await getModelfiles(LORA_DIR),
  "GET:/api/vaes": async () => await getModelfiles(VAE_DIR),
  "GET:/api/images": async () => {
    try {
      const images = await listImages();
      return jsonResponse(images);
    } catch (error) {
      console.error("Error reading result directory:", error);
      return jsonResponse({ error: "Failed to list images" }, 500);
    }
  },
  "POST:/api/diffuse": async (request?: Request) => {
    if (!request) throw new Error("Request is required for this endpoint");

    try {
      const body = (await request.json()) as DiffusionParams;

      if (!body.model) {
        return jsonResponse({ error: "Model is required" }, 400);
      }

      const job = createJob(body);

      return jsonResponse({ jobId: job.id });
    } catch (error) {
      console.error("Error parsing request body:", error);
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
  },
  "GET:/api/diffusions": async (request?: Request) => {
    if (!request) throw new Error("Request is required for this endpoint");
    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");

    if (!jobId) {
      return jsonResponse({ error: "Job ID is required" }, 400);
    }

    const job = getJob(jobId);
    if (!job) {
      return jsonResponse({ error: "Job not found" }, 404);
    }

    const body = createDiffusionStream(jobId, job.params, request.signal);

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  },
  "POST:/api/background/upload": async (request?: Request) => {
    if (!request) throw new Error("Request is required for this endpoint");
    try {
      const formData = await request.formData();
      const file = formData.get("background");

      if (!file || !(file instanceof File)) {
        return jsonResponse({ error: "No file uploaded" }, 400);
      }

      const result = await processBackgroundImage(file);
      return jsonResponse(result);
    } catch (error) {
      console.error("Image processing error:", error);
      return jsonResponse({ error: "Image processing failed" }, 500);
    }
  },
  "DELETE:/api/background": async () => {
    try {
      await deleteBackgroundImage();
      return jsonResponse({
        success: true,
        message: "Background deleted",
      });
    } catch {
      return jsonResponse({ error: "Background not found" }, 404);
    }
  },
  "POST:/api/stop": async () => {
    if (stopDiffusion()) {
      return jsonResponse({
        success: true,
        message: "Diffusion stopped",
      });
    } else {
      return jsonResponse({ error: "No diffusion process running" }, 400);
    }
  },
  "GET:/api/config": async () => {
    try {
      const config = await readConfig();
      return jsonResponse(config);
    } catch (error) {
      console.error("Error reading config:", error);
      return jsonResponse({ error: "Failed to read config" }, 500);
    }
  },
  "POST:/api/config/save": async (request?: Request) => {
    if (!request) throw new Error("Request is required for this endpoint");
    try {
      const body = await request.text();
      const result = await saveConfig(body);
      return jsonResponse(result);
    } catch (error) {
      console.error("Error saving config:", error);
      return jsonResponse(
        {
          error: "Failed to save config",
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  },
  "GET:/api/system-info": async () => {
    try {
      async function getPhysicalCoreCount(): Promise<number | null> {
        const platform = process.platform;

        try {
          if (platform === "linux") {
            // lscpu -p=core outputs core IDs; filter out comments; count unique
            const proc = Bun.spawn([
              "bash",
              "-c",
              "lscpu -p=core | grep -v '^#' | sort -u | wc -l",
            ]);
            const output = await new Response(proc.stdout).text();
            return Number(output.trim());
          }

          if (platform === "darwin") {
            // macOS: sysctl for physical cores
            const proc = Bun.spawn(["sysctl", "-n", "hw.physicalcpu"]);
            const output = await new Response(proc.stdout).text();
            return Number(output.trim());
          }

          if (platform === "win32") {
            // Windows: WMIC
            const proc = Bun.spawn(["cmd", "/c", "WMIC CPU Get NumberOfCores"]);
            const output = await new Response(proc.stdout).text();
            const matches = output.match(/\d+/g);
            return matches ? Number(matches[0]) : null;
          }

          return null; // unsupported OS
        } catch {
          return null;
        }
      }

      const cpuCount = await getPhysicalCoreCount();
      if (cpuCount === null) {
        // Fallback to logical cores if physical cores detection fails
        const os = await import("os");
        return jsonResponse({ cpuCount: os.cpus().length });
      }

      return jsonResponse({ cpuCount });
    } catch (error) {
      console.error("Error getting system info:", error);
      return jsonResponse({ error: "Failed to get system info" }, 500);
    }
  },
};
