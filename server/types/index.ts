export interface DiffusionParams {
  model: string;
  vae: string;
  upscaleModel: string;
  clipL: string;
  clipG: string;
  t5xxl: string;
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfgScale: number;
  seed: number;
  width: number;
  height: number;
  clipSkip: number;
  diffusionFa: boolean;
  samplingMethod: string;
  scheduler: string;
  rng: string;
  samplerRng: string;
  diffusionConvDirect: boolean;
  vaeConvDirect: boolean;
  threads: number;
  offloadToCpu: boolean;
  forceSdxlVaeConvScale: boolean;
}

export type JobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface Job {
  id: string;
  status: JobStatus;
  params: DiffusionParams;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: DiffusionResult;
  logs: LogData[];
}

export interface LogData {
  type: "stdout" | "stderr";
  message: string;
}

export interface DiffusionResult {
  image?: Image;
  error?: string;
  code?: number;
  message?: string;
}

export interface Models {
  checkpoints: string[];
  embeddings: string[];
  loras: string[];
  vaes: string[];
  upscalers: string[];
  textEncoders: string[];
}

export type ExtraDataType = "embedding" | "lora";

export interface TriggerWord {
  type: ExtraDataType;
  target: string;
  words: string[];
}

export interface AppSettings {
  background: string;
  maxWidth: number;
  maxHeight: number;
}

export interface UserConfig {
  diffusion: DiffusionParams;
  settings: AppSettings;
  triggerWords: TriggerWord[];
}

export interface Image {
  url: string;
  name: string;
  mtime: number;
  metadata: Record<string, unknown>;
}
