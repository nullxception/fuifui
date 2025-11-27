import type { AppSettings, DiffusionParams } from "./types";

export const defaultDiffusionParams: DiffusionParams = {
  model: "",
  vae: "",
  prompt: "",
  negativePrompt: "",
  steps: 20,
  cfgScale: 7.0,
  seed: -1,
  clipSkip: -1,
  width: 512,
  height: 768,
  diffusionFa: false,
  samplingMethod: "euler_a",
  scheduler: "karras",
  rng: "std_default",
  samplerRng: "",
  diffusionConvDirect: false,
  vaeConvDirect: false,
  threads: -1,
  offloadToCpu: false,
  forceSdxlVaeConvScale: false,
};

export const defaultSettings: AppSettings = {
  background: "",
  maxWidth: 2048,
  maxHeight: 2048,
};
