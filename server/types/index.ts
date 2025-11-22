export interface DiffusionParams {
  model: string;
  vae: string;
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfgScale: number;
  seed: number;
  width: number;
  height: number;
  flashAttention: boolean;
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
  result?: DiffusionComplete;
  error?: DiffusionError;
}

export interface ImageMetadata {
  url: string;
  mtime: number;
  metadata: Record<string, unknown>;
}

export interface LogData {
  type: string;
  message: string;
  timestamp: number;
}

export interface DiffusionComplete {
  success: true;
  imageUrl: string;
}

export interface DiffusionError {
  error: string;
  code?: number;
  message?: string;
}
