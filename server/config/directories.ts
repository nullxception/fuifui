import { promises as fs } from "fs";
import { RESULT_DIR, UPLOAD_DIR } from "./constants";

export const ensureDirectories = async () => {
  await fs.mkdir(RESULT_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};
