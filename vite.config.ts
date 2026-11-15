// Vite config. `pnpm dev` serves on http://localhost:5173; `pnpm preview` serves the production
// build on http://localhost:4173. Both forward /api to the backend (API_PROXY_TARGET), so the app
// and the API share one origin on your machine: no CORS, and the refresh cookie just works.
//
// `pnpm preview` also sends the security headers (security-headers.config.ts), so the production
// build is checked with the real CSP; `pnpm build` writes them to dist/_headers for the host.
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {
  type ConfigEnv,
  defineConfig,
  loadEnv,
  type Plugin,
  type UserConfig,
} from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { headersFile, securityHeaders } from "./security-headers.config.ts";
import { apiOriginOf, parseAppEnv } from "./src/config/env-schema.ts";
import { parseDevServerEnv } from "./tooling/dev-server-env.ts";
import { createPwaOptions } from "./tooling/pwa.ts";

/** Writes dist/_headers (Netlify and Cloudflare Pages read it; other hosts copy its headers). */
function headersFilePlugin(apiOrigin: string | undefined): Plugin {
  return {
    name: "buddy:headers-file",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "_headers",
        source: headersFile({ apiOrigin }),
      });
    },
  };
}

/** The config for one mode. vitest.config.ts builds on it too. */
export function createViteConfig({ mode }: ConfigEnv): UserConfig {
  // "" loads every variable, not only VITE_* ones; each schema picks its own.
  const allEnv = loadEnv(mode, import.meta.dirname, "");
  const devEnv = parseDevServerEnv(allEnv);
  const apiOrigin = apiOriginOf(parseAppEnv(allEnv).VITE_API_BASE_URL);
  const proxy = {
    "/api": { target: devEnv.API_PROXY_TARGET, changeOrigin: false },
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA(createPwaOptions()),
      headersFilePlugin(apiOrigin),
    ],
    resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "src") },
    },
    // No CSP in development: Vite's hot reload needs inline scripts. `pnpm preview` has it.
    server: { port: 5173, strictPort: true, proxy },
    preview: {
      port: 4173,
      strictPort: true,
      proxy,
      headers: securityHeaders({ apiOrigin, local: true }),
    },
    build: {
      // The browsers Tailwind CSS 4 supports (see README).
      target: ["chrome111", "edge111", "firefox128", "safari16.4"],
      // Source maps are built for error tracking, but no served file links to them.
      sourcemap: "hidden",
    },
  };
}

export default defineConfig(createViteConfig);
