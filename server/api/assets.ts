import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { ROOT_DIR, THUMBS_DIR } from "../constants";

const serveThumbnail = async (url: URL, size: number): Promise<Response> => {
  const pathname = url.pathname;
  const filepath = path.join(ROOT_DIR, pathname);
  let thumb = path.basename(pathname);
  thumb = `${thumb}.cache-${size}.webp`;
  thumb = path.join(THUMBS_DIR, thumb);

  if (await fs.exists(thumb)) {
    return new Response(Bun.file(thumb));
  }

  const buf = await sharp(filepath)
    .resize(size, null, { fit: "inside" })
    .webp({ quality: 70 })
    .toBuffer();
  await Bun.write(thumb, buf);

  return new Response(Bun.file(thumb));
};

const serveStatic = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Serve static files from public directory (user-uploaded images)
  if (pathname.startsWith("/upload/")) {
    const filepath = path.join(ROOT_DIR, "public", pathname);
    return new Response(Bun.file(filepath));
  }

  // Serve output images
  if (pathname.startsWith("/output/")) {
    const filepath = path.join(ROOT_DIR, pathname);
    const size = Number(url.searchParams.get("size")) || 0;
    if (size >= 126 && size <= 512) {
      // looks like we're getting thumbnail request
      return await serveThumbnail(url, size);
    }

    return new Response(Bun.file(filepath));
  }

  return new Response("Not found", { status: 404 });
};

export default serveStatic;
