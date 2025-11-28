import { file, spawn, type Subprocess } from "bun";
import path from "path";
import {
  EMBEDDING_DIR,
  LORA_DIR,
  MODEL_DIR,
  OUTPUT_DIR,
  ROOT_DIR,
  UPSCALER_DIR,
  VAE_DIR,
} from "../../constants";
import type {
  DiffusionComplete,
  DiffusionError,
  DiffusionParams,
  LogData,
} from "../../types";
import {
  addJobLog,
  getJob,
  setJobError,
  setJobResult,
  updateJobStatus,
} from "./jobs";

const activeProcesses = new Map<string, Subprocess>();

/**
 * Gets the current active Subprocess for a given job ID.
 * @param jobId Optional job ID.
 * @returns The active Subprocess or null.
 */
export const getCurrentProcess = (jobId?: string): Subprocess | null => {
  if (jobId) {
    return activeProcesses.get(jobId) || null;
  }
  return activeProcesses.size > 0
    ? Array.from(activeProcesses.values())[0] || null
    : null;
};

/**
 * Stops the diffusion process for a given job ID or all processes.
 * @param jobId Optional job ID.
 * @returns True if a process was stopped, false otherwise.
 */
export const stopDiffusion = (jobId?: string): boolean => {
  if (jobId) {
    const process = activeProcesses.get(jobId);
    if (process) {
      process.kill();
      activeProcesses.delete(jobId);
      updateJobStatus(jobId, "cancelled");
      return true;
    }
  } else {
    for (const [id, process] of activeProcesses.entries()) {
      process.kill();
      updateJobStatus(id, "cancelled");
    }
    activeProcesses.clear();
    return true;
  }
  return false;
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
  const outputFilename = `${timestamp}.png`;
  const outputPath = path.join(OUTPUT_DIR, "txt2img", outputFilename);
  const modelPath = path.join(MODEL_DIR, params.model || "");

  // sd at project root or from $PATH
  const project_sd = path.join(ROOT_DIR, "sd");
  const sd = (await file(project_sd).exists()) ? project_sd : "sd";

  const args = [
    "-m",
    modelPath,
    "--lora-model-dir",
    LORA_DIR,
    "--embd-dir",
    EMBEDDING_DIR,
    "-p",
    params.prompt || "",
    "-n",
    params.negativePrompt || "",
    "--steps",
    params.steps || "20",
    "--cfg-scale",
    params.cfgScale || "7.0",
    "-s",
    params.seed || "-1",
    "-W",
    params.width || "512",
    "-H",
    params.height || "768",
    "--sampling-method",
    params.samplingMethod || "euler_a",
    "--scheduler",
    params.scheduler || "karras",
    "-o",
    outputPath,
  ];

  console.log(params);

  if (params.clipSkip) {
    args.push("--clip-skip", params.clipSkip);
  }

  if (params.vae.length ?? 0 > 0) {
    const vaePath = path.join(VAE_DIR, params.vae || "");
    args.push("--vae", vaePath);
  }

  if (params.upscaleModel.length ?? 0 > 0) {
    const upscaleModelPath = path.join(UPSCALER_DIR, params.upscaleModel || "");
    args.push("--upscale-model", upscaleModelPath);
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

  const sendLog = (type: string, message: string) => {
    const log = message.trim().replaceAll(ROOT_DIR + path.sep, "");
    const data: LogData = {
      type,
      message: log,
      timestamp: Date.now(),
    };
    if (type === "stderr") {
      console.error(log);
    } else {
      console.log(log);
    }
    addJobLog(jobId, data);
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
    const errorData: DiffusionError = {
      error: "Process spawn failed",
      code: sdProcess.exitCode || undefined,
    };
    setJobError(jobId, errorData);
    return;
  }

  activeProcesses.set(jobId, sdProcess);
  updateJobStatus(jobId, "running");

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
        // eslint-disable-next-line no-control-regex
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

    console.log(`child process exited with code ${code}`);
    activeProcesses.delete(jobId);
    if (code === 0) {
      sendLog(
        "stdout",
        `Diffusion completed successfully! Image saved as: ${outputFilename}`,
      );
      const completeData: DiffusionComplete = {
        success: true,
        imageUrl: `/output/txt2img/${outputFilename}`,
      };
      setJobResult(jobId, completeData);
    } else {
      const job = getJob(jobId);
      if (job?.status !== "cancelled") {
        sendLog("stderr", `Diffusion failed with exit code: ${code}`);
        setJobError(jobId, { error: "Diffusion failed", code });
      }
    }
  } catch (error) {
    const job = getJob(jobId);
    if (job?.status !== "cancelled") {
      const msg = error instanceof Error ? error.message : String(error);
      sendLog("stderr", `Process error: ${msg}`);
      setJobError(jobId, { error: "Process error", message: msg });
    }
  }
};
