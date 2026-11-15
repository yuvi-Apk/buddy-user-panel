// Vite config. `pnpm dev` serves on http://localhost:5173; `pnpm preview` serves the production
// build on http://localhost:4173. Both forward /api to the backend (API_PROXY_TARGET), so the app
// and the API share one origin on your machine: no CORS, and the refresh cookie just works.
//
// `pnpm preview` also sends the security headers (tooling/security-headers.ts), so the production
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
import { createPwaOptions } from "./tooling/pwa.ts";
import {
  buildHeadersFile,
  buildSecurityHeaders,
} from "./tooling/security-headers.ts";

const fromRoot = (folder: string) => path.resolve(import.meta.dirname, folder);

/** Writes dist/_headers (Netlify and Cloudflare Pages read it; other hosts copy its headers). */
function headersFilePlugin(apiOrigin: string | undefined): Plugin {
  return {
    name: "buddy:headers-file",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "_headers",
        source: buildHeadersFile({ apiOrigin }),
      });
    },
  };
}

/** The config for one mode. vitest.config.ts builds on it too. */
export function createViteConfig({ mode }: ConfigEnv): UserConfig {
  // "" loads every variable in .env, not only the VITE_* ones.
  const envFile = loadEnv(mode, import.meta.dirname, "");
  const apiBaseUrl = envFile.VITE_API_BASE_URL ?? "/api/v1";
  const proxyTarget = envFile.API_PROXY_TARGET ?? "http://localhost:4000";
  // Set only when the API is on another site; the CSP must then allow it.
  const apiOrigin = apiBaseUrl.startsWith("http")
    ? new URL(apiBaseUrl).origin
    : undefined;
  const proxy = { "/api": { target: proxyTarget, changeOrigin: false } };

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA(createPwaOptions()),
      headersFilePlugin(apiOrigin),
    ],
    resolve: {
      alias: { "@": fromRoot("src"), "@tests": fromRoot("tests") },
    },
    // No CSP in development: Vite's hot reload needs inline scripts. `pnpm preview` has it.
    server: { port: 5173, strictPort: true, proxy },
    preview: {
      port: 4173,
      strictPort: true,
      proxy,
      headers: buildSecurityHeaders({ apiOrigin, local: true }),
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
