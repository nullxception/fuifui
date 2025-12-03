import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { PUBLIC_DIR, ROOT_DIR, THUMBS_DIR } from "../dirs";

const assetsCacheControl = "public, max-age=31536000, immutable";

const serveThumbnail = async (url: URL, size: number): Promise<Response> => {
  const pathname = url.pathname;
  const filepath = path.join(ROOT_DIR, pathname);
  let thumb = path.parse(pathname).name;
  thumb = `${thumb}--${size}.webp`;
  thumb = path.join(THUMBS_DIR, thumb);

  if (await fs.exists(thumb)) {
    return new Response(Bun.file(thumb), {
      headers: { "Cache-Control": assetsCacheControl },
    });
  }

  const buf = await sharp(filepath)
    .resize(size, null, { fit: "inside" })
    .webp({ quality: 70 })
    .toBuffer();
  await Bun.write(thumb, buf);

  return new Response(Bun.file(thumb), {
    headers: { "Cache-Control": assetsCacheControl },
  });
};

const serveStatic = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Serve static files from public directory (user-uploaded images)
  if (pathname.startsWith("/upload/")) {
    const filepath = path.join(PUBLIC_DIR, pathname);
    return new Response(Bun.file(filepath), {
      headers: { "Cache-Control": assetsCacheControl },
    });
  }

  // Serve output images
  if (pathname.startsWith("/output/")) {
    const filepath = path.join(ROOT_DIR, pathname);
    const size = Number(url.searchParams.get("size")) || 0;
    if (size > 0) {
      // looks like we're getting thumbnail request
      return await serveThumbnail(url, size);
    }

    return new Response(Bun.file(filepath), {
      headers: { "Cache-Control": assetsCacheControl },
    });
  }

  return new Response("Not found", { status: 404 });
};

export default serveStatic;
