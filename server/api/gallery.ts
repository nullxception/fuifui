import { TRPCError } from "@trpc/server";
import exifr from "exifr";
import { promises as fs } from "fs";
import path from "path";
import { OUTPUT_DIR, THUMBS_DIR } from "server/dirs";
import { deleteJobByResultFile } from "server/services/jobs";
import type { Image } from "server/types";

export const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];

export async function getDataFromImage(filePath: string): Promise<Image> {
  try {
    const stats = await fs.stat(filePath);
    const file = path.parse(filePath);

    let metadata = {};
    try {
      metadata = await exifr.parse(filePath, {
        userComment: true,
        xmp: true,
        icc: false,
      });
    } catch (e) {
      console.warn(`Failed to parse metadata for ${file.name}`, e);
    }

    return {
      name: file.name,
      url: path.join("/output", path.relative(OUTPUT_DIR, filePath)),
      mtime: stats.mtime.getTime(),
      metadata,
    };
  } catch (error) {
    console.error(`Error reading ${filePath}`, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to read ${filePath} metadata`,
      cause: error,
    });
  }
}

async function cleanupThumbnails(img: string) {
  const filename = path.basename(img);
  const files = await fs.readdir(THUMBS_DIR);

  files
    .filter((file) => file.startsWith(filename))
    .forEach(async (it) => {
      const thumb = path.join(THUMBS_DIR, it);
      console.log(`thumbnails: removing ${thumb}`);
      await Bun.file(thumb).delete();
    });
}

export async function listImages(limit: number, offset?: number | null) {
  try {
    const dir = path.join(OUTPUT_DIR, "txt2img");
    const files = await fs.readdir(dir);

    // Filter and get stats for all files (needed for sorting)
    const stats = await Promise.all(
      files
        .filter((file) =>
          IMAGE_EXT.some((ext) => file.toLowerCase().endsWith(ext)),
        )
        .map(async (filename) => {
          const filePath = path.join(dir, filename);
          const stats = await fs.stat(filePath);
          return {
            filename,
            mtime: stats.mtime.getTime(),
            filePath,
          };
        }),
    );

    stats.sort((a, b) => b.mtime - a.mtime);
    const o = offset ?? 0;
    const paginatedFiles = stats.slice(o, o + limit);

    // Parse metadata only for the current page
    const images = await Promise.all(
      paginatedFiles.map(async ({ filename, mtime, filePath }) => {
        let metadata = {};
        try {
          metadata = await exifr.parse(filePath, {
            userComment: true,
            xmp: true,
            icc: false,
          });
        } catch (e) {
          console.warn(`Failed to parse metadata for ${filename}`, e);
        }

        return {
          name: path.parse(filename).name,
          url: path.join("/output", path.relative(OUTPUT_DIR, filePath)),
          mtime,
          metadata,
        };
      }),
    );

    return images;
  } catch (error) {
    console.error("Error reading output directory:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to list images",
      cause: error,
    });
  }
}

export async function removeImages(images: string[]) {
  try {
    for (const image of images) {
      let img = path.normalize(image);
      if (!img.startsWith("/output/")) {
        continue;
      }
      img = path.join(OUTPUT_DIR, path.normalize(img.replace("/output", "")));
      console.log(`removing ${img}`);
      await Bun.file(img).delete();
      cleanupThumbnails(img);
      deleteJobByResultFile(image);
    }

    return { message: "Image(s) removed" };
  } catch (e) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Image(s) not found",
      cause: e,
    });
  }
}
