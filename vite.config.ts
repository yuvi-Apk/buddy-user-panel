// Vite config. `pnpm dev` serves on http://localhost:5173; `pnpm preview` serves the production
// build on http://localhost:4173.
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: {
    // The browsers Tailwind CSS 4 supports (see README).
    target: ["chrome111", "edge111", "firefox128", "safari16.4"],
    // Source maps are built for error tracking, but no served file links to them.
    sourcemap: "hidden",
  },
});
