import { promises as fs } from "fs";
import { sendJson } from "server/ws";
import {
  CHECKPOINT_DIR,
  EMBEDDING_DIR,
  LORA_DIR,
  TEXT_ENCODER_DIR,
  UPSCALER_DIR,
  VAE_DIR,
} from "../dirs";
import type { DiffusionParams, Models } from "../types";
import { startDiffusion, stopDiffusion } from "./services/diffusion";
import { createJob, jobEvents } from "./services/jobs";

const getFileList = async (dir: string): Promise<string[]> => {
  const files = await fs.readdir(dir);
  return files.filter((file) => !/.placeholder$/.test(file));
};

export const diffusionModels = async () => {
  try {
    return Response.json(<Models>{
      checkpoints: await getFileList(CHECKPOINT_DIR),
      embeddings: await getFileList(EMBEDDING_DIR),
      loras: await getFileList(LORA_DIR),
      vaes: await getFileList(VAE_DIR),
      upscalers: await getFileList(UPSCALER_DIR),
      textEncoders: await getFileList(TEXT_ENCODER_DIR),
    });
  } catch (error) {
    console.error("Error reading models directory:", error);
    return Response.json({ error: "Failed to list models" }, { status: 500 });
  }
};

export const diffusionStart = async (
  ws: Bun.ServerWebSocket,
  param: DiffusionParams,
) => {
  try {
    if (!param.model) {
      return sendJson(ws, { error: "Model is required" });
    }

    const job = createJob(param);
    startDiffusion(job.id, param);
    sendJson(ws, { type: "jobId", data: job.id });
  } catch (error) {
    console.error("Error parsing request body:", error);
    sendJson(ws, { error: "Invalid JSON body" });
  }
};

export const diffusionStop = async (ws: Bun.ServerWebSocket, id: string) => {
  stopDiffusion(id);
  sendJson(ws, { type: "status", state: "stopped" });
};

export const diffusionProgress = async (ws: Bun.ServerWebSocket) => {
  const sendEvent = (event: string, data: unknown) => {
    sendJson(ws, { type: "event", event, data });
  };

  jobEvents.on("log", ({ data }: { data: unknown }) => {
    sendEvent("log", data);
  });

  jobEvents.on("complete", ({ data }: { data: unknown }) => {
    sendEvent("complete", data);
  });

  jobEvents.on("error", ({ data }: { data: unknown }) => {
    sendEvent("error", data);
  });
};
