import path from "path";

export const PORT = 5141;

export const ROOT_DIR = path.join(import.meta.dir, "..");
export const MODEL_DIR = path.join(ROOT_DIR, "models/checkpoint");
export const EMBEDDING_DIR = path.join(ROOT_DIR, "models/embedding");
export const LORA_DIR = path.join(ROOT_DIR, "models/lora");
export const VAE_DIR = path.join(ROOT_DIR, "models/vae");
export const UPSCALER_DIR = path.join(ROOT_DIR, "models/upscaler");
export const TEXT_ENCODER_DIR = path.join(ROOT_DIR, "models/textencoder");
export const OUTPUT_DIR = path.join(ROOT_DIR, "output");
export const THUMBS_DIR = path.join(ROOT_DIR, "output", ".thumbs");
export const UPLOAD_DIR = path.join(ROOT_DIR, "public/upload");
export const CONFIG_PATH = path.join(ROOT_DIR, "config.yaml");

export const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];
