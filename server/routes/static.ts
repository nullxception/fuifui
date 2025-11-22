import { promises as fs } from "fs";
import path from "path";
import { SUPPORTED_STATIC_EXTENSIONS } from "../config/constants";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export const serveStatic = async (filepath: string): Promise<Response> => {
  try {
    const file = await fs.readFile(filepath);
    const ext = path.extname(filepath);
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new Response("File not found", { status: 404 });
  }
};

export const handleStaticRoutes = async (
  url: URL,
  __dirname: string,
): Promise<Response | null> => {
  const pathname = url.pathname;

  // Serve static files from public directory (user-generated content)
  if (pathname.startsWith("/result/") || pathname.startsWith("/upload/")) {
    const filepath = path.join(__dirname, "public", pathname);
    return await serveStatic(filepath);
  }

  // Serve static assets from dist directory (built frontend)
  const ext = path.extname(pathname);
  if (ext && SUPPORTED_STATIC_EXTENSIONS.includes(ext)) {
    const filepath = path.join(__dirname, "dist", pathname);
    return await serveStatic(filepath);
  }

  // Serve index.html for all other routes (SPA support)
  const indexPath = path.join(__dirname, "dist", "index.html");
  return await serveStatic(indexPath);
};
