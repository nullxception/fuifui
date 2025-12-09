import type { GGMLWeightType } from "./ggml";

export type DiffusionModelType = "full" | "standalone";

export interface DiffusionParams {
  model: string;
  modelType: DiffusionModelType;
  quantizationType?: GGMLWeightType;
  vae?: string;
  upscaleModel?: string;
  clipL?: string;
  clipG?: string;
  t5xxl?: string;
  llm?: string;
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfgScale: number;
  seed: number;
  width: number;
  height: number;
  clipSkip: number;
  diffusionFa?: boolean;
  samplingMethod?: string;
  scheduler?: string;
  rng?: string;
  samplerRng?: string;
  diffusionConvDirect?: boolean;
  vaeConvDirect?: boolean;
  threads: number;
  offloadToCpu?: boolean;
  forceSdxlVaeConvScale?: boolean;
  verbose?: boolean;
}

export type ExtraDataType = "embedding" | "lora";

export interface TriggerWord {
  type: ExtraDataType;
  target: string;
  loraStrength?: number;
  words: string[];
}

export interface AppSettings {
  background?: string;
  maxWidth: number;
  maxHeight: number;
}

export interface UserConfig {
  diffusion: DiffusionParams;
  settings: AppSettings;
  triggerWords: TriggerWord[];
}
