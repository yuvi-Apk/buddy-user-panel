// The PWA set-up (pwa.md), used by vite.config.ts and checked by tests/guardrails/pwa.test.ts.
//
//   - A new version waits for the person to tap "Reload" (registerType "prompt"), so the app never
//     reloads in the middle of a quiz. src/pwa/update-prompt.tsx asks.
//   - The service worker precaches only the built static files. Nothing from /api is ever cached
//     (core-rules #13): answers hold personal data, and phones are shared.
//   - Colors come from tokens.css and the name from en.json, so nothing is typed twice.
import type { ManifestOptions, VitePWAOptions } from "vite-plugin-pwa";
import en from "../src/lang/en.json" with { type: "json" };
import { parseTokenRules, readTokensCss, tokensFor } from "./design-tokens.ts";

/** The icons `pnpm pwa:icons` makes from public/logo.svg (pwa-assets.config.ts). */
export const PWA_ICONS = [
  { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
  { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
  { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
  {
    src: "maskable-icon-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
] as const;

/** The file types the service worker precaches. Never source maps, never the headers file. */
export const PRECACHED_FILES = "**/*.{js,css,html,woff2,svg,png,ico}";

/** Indigo Ink in light mode: the default theme, used before the app has started. */
export function defaultThemeColors(): { primary: string; paper: string } {
  const tokens = tokensFor(parseTokenRules(readTokensCss()), {});
  const primary = tokens.get("--primary");
  const paper = tokens.get("--background");
  if (!primary || !paper)
    throw new Error("tokens.css has no --primary or --background.");
  return { primary, paper };
}

export function createManifest(): Partial<ManifestOptions> {
  const { primary, paper } = defaultThemeColors();
  return {
    id: "/",
    name: en.common.appName,
    short_name: en.common.appName,
    description: en.common.appDescription,
    lang: "en",
    dir: "ltr",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    categories: ["education"],
    theme_color: primary,
    background_color: paper,
    icons: PWA_ICONS.map((icon) => ({ ...icon })),
  };
}

export function createPwaOptions(): Partial<VitePWAOptions> {
  return {
    registerType: "prompt",
    // Registered from the bundle (update-prompt.tsx), never by an inline script: the CSP allows none.
    injectRegister: false,
    manifest: createManifest(),
    // The icons and the logo are already in PRECACHED_FILES; nothing else from public/ is needed.
    includeAssets: [],
    // The glob above already holds the manifest icons; the plugin adds the manifest itself.
    includeManifestIcons: false,
    workbox: {
      globPatterns: [PRECACHED_FILES],
      // The service worker ships without a source map, like the rest of the served files.
      sourcemap: false,
      // Every page address opens the app shell offline, except the API.
      navigateFallback: "/index.html",
      navigateFallbackDenylist: [/^\/api\//],
      // No runtime caching at all: only the precached build files are ever stored.
      runtimeCaching: [],
      cleanupOutdatedCaches: true,
    },
    // In development the service worker stays off, so it never serves stale code while you work.
    devOptions: { enabled: false },
  };
}
