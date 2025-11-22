import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:5141",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:5141",
        changeOrigin: true,
      },
    },
    watch: {
      followSymlinks: false,
      ignored: [
        path.resolve(__dirname, "models"),
        path.resolve(__dirname, "bin"),
        "**/models/**",
      ],
    },
  },
});
