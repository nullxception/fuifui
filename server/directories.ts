import { promises as fs } from "fs";
import path from "path";
import { OUTPUT_DIR, THUMBS_DIR, UPLOAD_DIR } from "./constants";

export const ensureDirectories = async () => {
  await fs.mkdir(path.join(OUTPUT_DIR, "txt2img"), {
    recursive: true,
  });
  await fs.mkdir(path.join(THUMBS_DIR), { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};
