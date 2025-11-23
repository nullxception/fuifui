import { promises as fs } from "fs";
import path from "path";
import exifr from "exifr";
import sharp from "sharp";
import {
  OUTPUT_DIR,
  UPLOAD_DIR,
  SUPPORTED_IMAGE_EXTENSIONS,
} from "../config/constants";
import type { ImageMetadata } from "../types/index";

export const listImages = async (): Promise<ImageMetadata[]> => {
  try {
    const dir = path.join(OUTPUT_DIR, "txt2img");
    const files = await fs.readdir(dir);

    const imagePromises = files
      .filter((file) =>
        SUPPORTED_IMAGE_EXTENSIONS.some((ext) =>
          file.toLowerCase().endsWith(ext),
        ),
      )
      .map(async (file) => {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        let metadata = {};
        try {
          metadata = await exifr.parse(filePath, {
            userComment: true,
            xmp: true,
            icc: false,
          });
        } catch (e) {
          console.warn(`Failed to parse metadata for ${file}`, e);
        }

        return {
          url: `/output/txt2img/${file}`,
          mtime: stats.mtime.getTime(),
          metadata,
        };
      });

    const images = await Promise.all(imagePromises);
    return images.sort((a, b) => b.mtime - a.mtime);
  } catch (error) {
    console.error("Error reading output directory:", error);
    throw new Error("Failed to list images");
  }
};

export const processBackgroundImage = async (
  file: File,
): Promise<{
  filename: string;
  url: string;
}> => {
  const buffer = await file.arrayBuffer();
  const processedImage = await sharp(Buffer.from(buffer))
    .resize(3840, 2160, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();

  const filename = "background.webp";
  await fs.writeFile(path.join(UPLOAD_DIR, filename), processedImage);

  return {
    filename,
    url: `/upload/${filename}?t=${Date.now()}`,
  };
};

export const deleteBackgroundImage = async (): Promise<void> => {
  const filePath = path.join(UPLOAD_DIR, "background.webp");
  try {
    await fs.unlink(filePath);
  } catch {
    throw new Error("Background not found");
  }
};
