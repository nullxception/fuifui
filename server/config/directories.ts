import { promises as fs } from "fs";
import { OUTPUT_DIR, UPLOAD_DIR } from "./constants";
import path from "path";

export const ensureDirectories = async () => {
  await fs.mkdir(path.join(OUTPUT_DIR, "txt2img"), { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};
