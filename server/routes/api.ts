import { promises as fs } from "fs";
import {
  MODEL_DIR,
  EMBEDDING_DIR,
  LORA_DIR,
  VAE_DIR,
} from "../config/constants";
import { jsonResponse } from "../middleware/response";

export const getModels = async () => {
  try {
    const files = await fs.readdir(MODEL_DIR);
    const models = files.filter((file) => file != "placeholder");
    return jsonResponse(models);
  } catch (error) {
    console.error("Error reading models directory:", error);
    return jsonResponse({ error: "Failed to list models" }, 500);
  }
};

export const getEmbeddings = async () => {
  try {
    const files = await fs.readdir(EMBEDDING_DIR);
    const embeddings = files.filter((file) => file != "placeholder");
    return jsonResponse(embeddings);
  } catch (error) {
    console.error("Error reading embeddings directory:", error);
    return jsonResponse({ error: "Failed to list embeddings" }, 500);
  }
};

export const getLoras = async () => {
  try {
    const files = await fs.readdir(LORA_DIR);
    const loras = files.filter((file) => file != "placeholder");
    return jsonResponse(loras);
  } catch (error) {
    console.error("Error reading loras directory:", error);
    return jsonResponse({ error: "Failed to list loras" }, 500);
  }
};

export const getVae = async () => {
  try {
    const files = await fs.readdir(VAE_DIR);
    const models = files.filter((file) => file != "placeholder");
    return jsonResponse(models);
  } catch (error) {
    console.error("Error reading loras vae:", error);
    return jsonResponse({ error: "Failed to list vae" }, 500);
  }
};
