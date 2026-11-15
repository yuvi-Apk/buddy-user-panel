// Vite config. `pnpm dev` serves on http://localhost:5173; `pnpm preview` serves the production
// build on http://localhost:4173. Both forward /api to the backend (API_PROXY_TARGET), so the app
// and the API share one origin on your machine: no CORS, and the refresh cookie just works.
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type ConfigEnv, defineConfig, loadEnv, type UserConfig } from "vite";
import { parseDevServerEnv } from "./tooling/dev-server-env.ts";

/** The config for one mode. vitest.config.ts builds on it too. */
export function createViteConfig({ mode }: ConfigEnv): UserConfig {
  // "" loads every variable, not only VITE_* ones; only the dev-server ones are picked.
  const devEnv = parseDevServerEnv(loadEnv(mode, import.meta.dirname, ""));
  const proxy = {
    "/api": { target: devEnv.API_PROXY_TARGET, changeOrigin: false },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "src") },
    },
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
    build: {
      // The browsers Tailwind CSS 4 supports (see README).
      target: ["chrome111", "edge111", "firefox128", "safari16.4"],
      // Source maps are built for error tracking, but no served file links to them.
      sourcemap: "hidden",
    },
  };
}

export default defineConfig(createViteConfig);
