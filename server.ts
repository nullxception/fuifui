import { fileURLToPath } from "url";
import path from "path";
import { ensureDirectories } from "./server/config/directories";
import { PORT } from "./server/config/constants";
import { apiRoutes } from "./server/routes/index";
import { handleStaticRoutes } from "./server/routes/static";
import { addCorsHeaders, handleCorsPreflight } from "./server/middleware/cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure required directories exist
await ensureDirectories();

// Main server
Bun.serve({
  port: PORT,
  idleTimeout: 0, // Disable timeout for long-running diffusion processes
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    const routeKey = `${method}:${url.pathname}`;

    // Handle CORS preflight requests
    if (method === "OPTIONS") {
      return handleCorsPreflight();
    }

    // Check if route exists in our API routes
    if (apiRoutes[routeKey]) {
      const response = await apiRoutes[routeKey](request);
      return addCorsHeaders(response);
    }

    // Handle static file serving
    const staticResponse = await handleStaticRoutes(url, __dirname);
    if (staticResponse) {
      return addCorsHeaders(staticResponse);
    }

    // Fallback (shouldn't reach here due to SPA fallback in static routes)
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${PORT}`);
