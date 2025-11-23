import { spawn, type Subprocess } from "bun";
import path from "path";
import {
  SDCPP_BIN,
  MODEL_DIR,
  OUTPUT_DIR,
  EMBEDDING_DIR,
  LORA_DIR,
  VAE_DIR,
  projectRoot,
} from "../config/constants";
import type {
  DiffusionParams,
  LogData,
  DiffusionComplete,
  DiffusionError,
} from "../types/index";
import { updateJobStatus, setJobResult, setJobError } from "./jobService";

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
    ? Array.from(activeProcesses.values())[0]
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
 * Creates a ReadableStream for diffusion process logs and results.
 * @param jobId The unique job ID.
 * @param params Diffusion parameters.
 * @param signal AbortSignal to cancel the process.
 * @returns A ReadableStream.
 */
export const createDiffusionStream = (
  jobId: string,
  params: DiffusionParams,
  signal: AbortSignal,
) => {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const timestamp = Date.now();
      const outputFilename = `${timestamp}.png`;
      const outputPath = path.join(OUTPUT_DIR, "txt2img", outputFilename);
      const modelPath = path.join(MODEL_DIR, params.model || "");
      const vaePath = path.join(VAE_DIR, params.vae || "");

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

      if (params.vae?.length ?? 0 > 0) {
        args.push("--vae", vaePath);
      }

      if (params.rng) {
        args.push("--rng", params.rng);
      }

      if (params.samplerRng) {
        args.push("--sampler-rng", params.samplerRng);
      }

      if (params.flashAttention) {
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

      const safeEnqueue = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Controller is already closed")
          ) {
            console.log("Attempted to enqueue to closed controller, ignoring");
          } else {
            throw error;
          }
        }
      };

      const safeClose = () => {
        try {
          controller.close();
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Controller is already closed")
          ) {
            console.log(
              "Attempted to close already closed controller, ignoring",
            );
          }
        }
      };

      const sendLog = (type: string, message: string) => {
        const log = message.trim().replaceAll(projectRoot + path.sep, "");
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
        safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      sendLog(
        "stdout",
        `Starting diffusion with command: ${SDCPP_BIN} ${printableArgs(args)}`,
      );

      const sdProcess = spawn({
        cmd: [SDCPP_BIN, ...args.map((x) => x.toString())],
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
        safeEnqueue(`event: error\ndata: ${JSON.stringify(errorData)}\n\n`);
        safeClose();
        return;
      }

      activeProcesses.set(jobId, sdProcess);
      updateJobStatus(jobId, "running");

      // Set up AbortSignal listener for cancellation
      signal.addEventListener("abort", () => {
        sdProcess.kill();
        activeProcesses.delete(jobId);
        updateJobStatus(jobId, "cancelled");
        safeClose();
      });

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
          safeEnqueue(
            `event: complete\ndata: ${JSON.stringify(completeData)}\n\n`,
          );
        } else {
          sendLog("stderr", `Diffusion failed with exit code: ${code}`);
          const errorData: DiffusionError = {
            error: "Diffusion failed",
            code: code || undefined,
          };
          setJobError(jobId, errorData);
          safeEnqueue(`event: error\ndata: ${JSON.stringify(errorData)}\n\n`);
        }
      } catch (error) {
        // This catches errors like failure to execute the command/file, etc.
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Process error:", errorMessage);
        sendLog("stderr", `Process error: ${errorMessage}`);
        const errorData: DiffusionError = {
          error: "Process error",
          message: errorMessage,
        };
        setJobError(jobId, errorData);
        safeEnqueue(`event: error\ndata: ${JSON.stringify(errorData)}\n\n`);
      } finally {
        safeClose();
      }
    },
  });
};
