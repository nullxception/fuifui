import exifr from "exifr";
import { promises as fs } from "fs";
import path from "path";
import { IMAGE_EXT, OUTPUT_DIR, ROOT_DIR } from "../constants";
import type { Image } from "../types";

const list = async (limit: number, offset: number): Promise<Image[]> => {
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
    const paginatedFiles = stats.slice(offset, offset + limit);

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
          url: `/output/txt2img/${filename}`,
          name: filename,
          mtime,
          metadata,
        };
      }),
    );

    return images;
  } catch (error) {
    console.error("Error reading output directory:", error);
    throw new Error("Failed to list images");
  }
};

const remove = async (images: string[]): Promise<void> => {
  try {
    for (let img of images) {
      img = path.normalize(img);
      if (!img.startsWith("/output/")) {
        continue;
      }
      img = path.join(ROOT_DIR, img);
      console.log(`removing ${img}`);
      await Bun.file(img).delete();
    }
  } catch {
    throw new Error(`Image(s) not found`);
  }
};

export const listImages = async (req: Request) => {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  try {
    const files = await list(limit, offset);
    return Response.json(files);
  } catch (error) {
    console.error("Error reading output directory:", error);
    return Response.json({ error: "Failed to list images" }, { status: 500 });
  }
};

export const removeImages = async (request?: Request) => {
  if (!request) throw new Error("Request is required for this endpoint");
  try {
    const images = (await request.json()) as string[];
    await remove(images);
    return Response.json({
      success: true,
      message: "Image(s) removed",
    });
  } catch {
    return Response.json({ error: "Image(s) not found" }, { status: 404 });
  }
};
