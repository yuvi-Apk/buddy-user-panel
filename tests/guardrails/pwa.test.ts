// core-rules #13 and pwa.md: the service worker caches only the app's own static files, never
// /api; a new version waits for the person; the manifest and icons are complete and use the
// design tokens.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import en from "@/lang/en.json";
import {
  parseTokenRules,
  readTokensCss,
  tokensFor,
} from "../../tooling/design-tokens";
import {
  createManifest,
  createPwaOptions,
  PRECACHED_FILES,
  PWA_ICONS,
} from "../../tooling/pwa";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const PUBLIC = path.join(ROOT, "public");

const options = createPwaOptions();
const workbox = options.workbox ?? {};
const lightTokens = tokensFor(parseTokenRules(readTokensCss()), {});

describe("service worker", () => {
  it("waits for the person before using a new version", () => {
    expect(options.registerType).toBe("prompt");
  });

  it("is registered from the bundle, never by an inline script (CSP)", () => {
    expect(options.injectRegister).toBe(false);
  });

  it("caches nothing at runtime, so no API answer is ever stored", () => {
    expect(workbox.runtimeCaching ?? []).toEqual([]);
  });

  it("never answers an /api address with the app shell", () => {
    const denylist = workbox.navigateFallbackDenylist ?? [];
    for (const url of ["/api/v1/user/auth/me", "/api/v1/user/topics?page=2"]) {
      expect(
        denylist.some((pattern) => pattern.test(url)),
        url
      ).toBe(true);
    }
    for (const url of ["/today", "/organization/classes/abc"]) {
      expect(
        denylist.some((pattern) => pattern.test(url)),
        url
      ).toBe(false);
    }
  });

  it("precaches only built static files: no source maps, data or headers", () => {
    expect(workbox.globPatterns).toEqual([PRECACHED_FILES]);
    const extensions =
      /\{([^}]*)\}/.exec(PRECACHED_FILES)?.[1]?.split(",") ?? [];
    expect(extensions).not.toContain("map");
    expect(extensions).not.toContain("json");
    expect(extensions).not.toContain("txt");
  });

  it("is off in development", () => {
    expect(options.devOptions?.enabled).toBe(false);
  });
});

describe("manifest", () => {
  const manifest = createManifest();

  it("has the fields an installable app needs", () => {
    expect(manifest).toMatchObject({
      id: "/",
      name: en.common.appName,
      short_name: en.common.appName,
      start_url: "/?source=pwa",
      scope: "/",
      display: "standalone",
    });
  });

  it("takes its colors from the default theme's tokens", () => {
    expect(manifest.theme_color).toBe(lightTokens.get("--primary"));
    expect(manifest.background_color).toBe(lightTokens.get("--background"));
  });

  it("has 192 and 512 icons and a maskable one, and every icon file exists", () => {
    const sizes = PWA_ICONS.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(
      PWA_ICONS.some((icon) => "purpose" in icon && icon.purpose === "maskable")
    ).toBe(true);

    const files = [
      ...PWA_ICONS.map((icon) => icon.src),
      "favicon.ico",
      "apple-touch-icon-180x180.png",
    ];
    const missing = files.filter(
      (file) => !existsSync(path.join(PUBLIC, file))
    );
    expect(missing, "Run `pnpm pwa:icons`").toEqual([]);
  });
});

describe("public files", () => {
  it("the logo uses only Indigo Ink tokens (light mode)", () => {
    const svg = readFileSync(path.join(PUBLIC, "logo.svg"), "utf8");
    const colors = new Set(
      svg.match(/#[0-9a-f]{3,8}\b/gi)?.map((color) => color.toLowerCase())
    );
    const allowed = new Set([
      lightTokens.get("--primary"),
      lightTokens.get("--card"),
    ]);
    expect([...colors].filter((color) => !allowed.has(color))).toEqual([]);
  });

  it("robots.txt keeps search engines out of the app", () => {
    const robots = readFileSync(path.join(PUBLIC, "robots.txt"), "utf8");
    expect(robots).toMatch(/User-agent: \*\s+Disallow: \/\s*$/m);
  });
});
