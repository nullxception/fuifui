import path from "path";

export const projectRoot = path.dirname(Bun.main);

export const PORT = 5141;
export const SDCPP_BIN = "sd";

export const MODEL_DIR = path.join(projectRoot, "models/checkpoint");
export const EMBEDDING_DIR = path.join(projectRoot, "models/embedding");
export const LORA_DIR = path.join(projectRoot, "models/lora");
export const VAE_DIR = path.join(projectRoot, "models/vae");
export const OUTPUT_DIR = path.join(projectRoot, "output");
export const UPLOAD_DIR = path.join(projectRoot, "public/upload");
export const CONFIG_PATH = path.join(projectRoot, "config.yaml");

export const SUPPORTED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
export const SUPPORTED_STATIC_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
];
