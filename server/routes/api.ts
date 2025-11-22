import { promises as fs } from "fs";
import { jsonResponse } from "../middleware/response";

export const getModelfiles = async (path: string) => {
  try {
    const files = await fs.readdir(path);
    const models = files.filter((file) => file != "placeholder");
    return jsonResponse(models);
  } catch (error) {
    console.error("Error reading models directory:", error);
    return jsonResponse({ error: "Failed to list models" }, 500);
  }
};
