import exifr from "exifr";
import { promises as fs } from "fs";
import path from "path";
import { OUTPUT_DIR, THUMBS_DIR } from "../dirs";
import type { Image } from "../types";

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
    throw new Error(`Failed to read ${filePath} metadata`);
  }
}

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
      img = path.join(OUTPUT_DIR, path.normalize(img));
      console.log(`removing ${img}`);
      await Bun.file(img).delete();
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
