import { promises as fs } from "fs";
import path from "path";
import { OUTPUT_DIR, PUBLIC_DIR, THUMBS_DIR } from "server/dirs";
import sharp from "sharp";

const assetsCacheControl = "public, max-age=31536000, immutable";

async function serveThumbnail(filepath: string, size: number) {
  let thumb = path.parse(filepath).name;
  thumb = `${thumb}--${size}.jpg`;
  thumb = path.join(THUMBS_DIR, thumb);

  if (await fs.exists(thumb)) {
    return new Response(Bun.file(thumb), {
      headers: { "Cache-Control": assetsCacheControl },
    });
  }

  await sharp(filepath)
    .resize(size, null, { fit: "inside" })
    .jpeg({ quality: 80, progressive: true })
    .toFile(thumb);

  return new Response(Bun.file(thumb), {
    headers: { "Cache-Control": assetsCacheControl },
  });
}

async function serveStatic(req: Request) {
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
    const filepath = path.join(OUTPUT_DIR, pathname.replace("/output", ""));
    const width = Number(url.searchParams.get("width")) || 0;
    if (width > 0) {
      // looks like we're getting thumbnail request
      return await serveThumbnail(filepath, width);
    }

    return new Response(Bun.file(filepath), {
      headers: { "Cache-Control": assetsCacheControl },
    });
  }

  return new Response("Not found", { status: 404 });
}

export default serveStatic;
