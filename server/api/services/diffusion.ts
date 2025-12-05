import { file, spawn } from "bun";
import path from "path";
import {
  CHECKPOINT_DIR,
  EMBEDDING_DIR,
  LLM_DIR,
  LORA_DIR,
  OUTPUT_DIR,
  ROOT_DIR,
  TEXT_ENCODER_DIR,
  UPSCALER_DIR,
  VAE_DIR,
} from "../../dirs";
import type { DiffusionParams } from "../../types";
import { getDataFromImage as getImageData } from "../gallery";
import { activeProcesses, addJobLog, getJob, updateJobStatus } from "./jobs";

export const stopDiffusion = (jobId?: string) => {
  if (jobId) {
    updateJobStatus({ id: jobId, status: "cancelled" });
  }

  for (const [id] of activeProcesses.entries()) {
    updateJobStatus({ id: id, status: "cancelled" });
  }
};

const printableArgs = (args: (string | number)[]) => {
  return args
    .map((arg) =>
      arg.toString().includes(" ")
        ? `"${arg.toString().replace(/"/g, '\\"')}"`
        : arg,
    )
    .join(" ");
};

const pad = (num: number) => String(num).padStart(2, "0");

const filename = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${year}${month}${day}-${hour}${minute}${second}`;
};

const hasValue = (value: string | undefined) => {
  if (typeof value !== "string") return false;
  return value?.trim()?.length ?? 0 > 0;
};

/**
 * Starts the diffusion process in the background.
 * @param jobId The unique job ID.
 * @param params Diffusion parameters.
 */
export const startDiffusion = async (
  jobId: string,
  params: DiffusionParams,
) => {
  const timestamp = Date.now();
  const outputFilename = `${filename(timestamp)}.png`;
  const outputPath = path.join(OUTPUT_DIR, "txt2img", outputFilename);
  const modelPath = path.join(CHECKPOINT_DIR, params.model || "");

  // sd at project root or from $PATH
  const project_sd = path.join(ROOT_DIR, "sd");
  const sd = (await file(project_sd).exists()) ? project_sd : "sd";

  const args = [
    "--steps",
    params.steps || "20",
    "--cfg-scale",
    params.cfgScale || "7.0",
    "-s",
    params.seed || "-1",
    "-W",
    params.width || "512",
    "-H",
    params.height || "512",
    "-o",
    outputPath,
  ];

  if (params.modelType === "standalone") {
    args.push("--diffusion-model", modelPath);
  } else if (params.modelType === "full") {
    args.push("-m", modelPath);
  }

  if (params.weightType) {
    args.push("--type", params.weightType);
  }

  if (hasValue(params.prompt)) {
    args.push("-p", params.prompt);
  }

  if (hasValue(params.negativePrompt)) {
    args.push("-n", params.negativePrompt);
  }

  const allPrompts = params.prompt + params.negativePrompt;
  if (allPrompts.includes("embedding:")) {
    args.push("--embd-dir", EMBEDDING_DIR);
  }

  if (allPrompts.includes("lora:")) {
    args.push("--lora-model-dir", LORA_DIR);
  }

  if (hasValue(params.samplingMethod)) {
    args.push("--sampling-method", params.samplingMethod ?? "euler");
  }

  if (hasValue(params.scheduler)) {
    args.push("--scheduler", params.scheduler ?? "discrete");
  }

  if (params.clipSkip) {
    args.push("--clip-skip", params.clipSkip);
  }

  if (hasValue(params.vae)) {
    const vaePath = path.join(VAE_DIR, params.vae || "");
    args.push("--vae", vaePath);
  }

  if (hasValue(params.upscaleModel)) {
    const upscaleModelPath = path.join(UPSCALER_DIR, params.upscaleModel || "");
    args.push("--upscale-model", upscaleModelPath);
  }

  if (hasValue(params.clipL)) {
    const clipLPath = path.join(TEXT_ENCODER_DIR, params.clipL || "");
    args.push("--upscale-model", clipLPath);
  }

  if (hasValue(params.clipG)) {
    const clipGPath = path.join(TEXT_ENCODER_DIR, params.clipG || "");
    args.push("--upscale-model", clipGPath);
  }
  if (hasValue(params.t5xxl)) {
    const t5xxlPath = path.join(TEXT_ENCODER_DIR, params.t5xxl || "");
    args.push("--t5xxl", t5xxlPath);
  }
  if (hasValue(params.llm)) {
    const llmPath = path.join(LLM_DIR, params.llm || "");
    args.push("--llm", llmPath);
  }
  if (params.rng) {
    args.push("--rng", params.rng);
  }

  if (params.samplerRng) {
    args.push("--sampler-rng", params.samplerRng);
  }

  if (params.diffusionFa) {
    args.push("--diffusion-fa");
  }

  if (params.diffusionConvDirect) {
    args.push("--diffusion-conv-direct");
  }

  if (params.vaeConvDirect) {
    args.push("--vae-conv-direct");
  }

  if (params.threads) {
    args.push("--threads", params.threads);
  }

  if (params.offloadToCpu) {
    args.push("--offload-to-cpu");
  }

  if (params.forceSdxlVaeConvScale) {
    args.push("--force-sdxl-vae-conv-scale");
  }

  const sendLog = (type: "stdout" | "stderr", message: string) => {
    const log = message.trim().replaceAll(ROOT_DIR + path.sep, "");
    if (type === "stderr") {
      console.error(log);
    } else {
      console.log(log);
    }
    addJobLog(jobId, { type, message: log }, params);
  };

  sendLog(
    "stdout",
    `Starting diffusion with command: ${sd} ${printableArgs(args)}`,
  );

  const sdProcess = spawn({
    cmd: [sd, ...args.map((x) => x.toString())],
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
  });
  updateJobStatus({ id: jobId, status: "running", process: sdProcess });

  // Check for errors related to process creation
  if (sdProcess.exitCode != null) {
    console.error(
      "Failed to spawn process immediately with code:",
      sdProcess.exitCode,
    );
    sendLog(
      "stderr",
      `Failed to spawn process immediately with code: ${sdProcess.exitCode}`,
    );
    updateJobStatus({
      id: jobId,
      status: "failed",
      data: {
        error: "Process spawn failed",
        code: sdProcess.exitCode || undefined,
      },
    });
    return;
  }

  const textDecoder = new TextDecoder();
  const stdoutReader = sdProcess.stdout.getReader();
  const filterLogs = (message: string) => {
    return message.replace(/\[(\w)\w+.*\](.*)\.\wpp:(\d+)\s+-./, "");
  };
  const readStdout = async () => {
    while (true) {
      const { done, value } = await stdoutReader.read();
      if (done) break;
      const data = textDecoder.decode(value);
      data
        .split(/\n|\x1b\[K.*/)
        .map((line) => line.trim())
        .filter((line) => line.length > 1)
        .forEach((log) => sendLog("stdout", filterLogs(log)));
    }
  };

  const stderrReader = sdProcess.stderr.getReader();
  const readStderr = async () => {
    while (true) {
      const { done, value } = await stderrReader.read();
      if (done) break;
      const data = textDecoder.decode(value);
      sendLog("stderr", data);
    }
  };

  const stdoutPromise = readStdout();
  const stderrPromise = readStderr();

  // Wait for the process to complete and get the exit code
  // Bun's Subprocess has an .exited property which is a Promise<number>
  try {
    const code = await sdProcess.exited;

    // Wait for all stream reading to finish
    await Promise.allSettled([stdoutPromise, stderrPromise]);

    if (code === 0) {
      sendLog(
        "stdout",
        `Diffusion completed successfully! Image saved as: ${outputFilename}`,
      );
      updateJobStatus({
        id: jobId,
        status: "completed",
        data: {
          image: await getImageData(outputPath),
        },
      });
    } else {
      const job = getJob(jobId);
      if (job?.status !== "cancelled") {
        sendLog("stderr", `Diffusion failed with exit code: ${code}`);
        updateJobStatus({
          id: jobId,
          status: "failed",
          data: {
            error: "Diffusion failed",
            code,
          },
        });
      }
    }
  } catch (error) {
    const job = getJob(jobId);
    if (job?.status !== "cancelled") {
      const msg = error instanceof Error ? error.message : String(error);
      sendLog("stderr", `Process error: ${msg}`);
      updateJobStatus({
        id: jobId,
        status: "failed",
        data: {
          error: "Process error",
          message: msg,
        },
      });
    }
  }
};
