// The service worker promises (tooling/pwa.ts): it never stores or answers /api, a new version
// waits for the person, and every icon the manifest names exists.
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createPwaOptions, PWA_ICONS } from "../../tooling/pwa";

const pwaOptions = createPwaOptions();
const workbox = pwaOptions.workbox ?? {};

describe("service worker", () => {
  it("caches nothing at runtime, so no API answer is ever stored", () => {
    expect(workbox.runtimeCaching ?? []).toEqual([]);
  });

  it("never answers an /api address with the app shell", () => {
    const denylist = workbox.navigateFallbackDenylist ?? [];
    const isDenied = (url: string) =>
      denylist.some((pattern) => pattern.test(url));

    expect(isDenied("/api/v1/user/auth/me")).toBe(true);
    expect(isDenied("/today")).toBe(false);
  });

  it("waits for the person before using a new version", () => {
    expect(pwaOptions.registerType).toBe("prompt");
  });
});

describe("icons", () => {
  it("every icon file exists (run `pnpm pwa:icons` after changing the logo)", () => {
    const iconFiles = [
      ...PWA_ICONS.map((icon) => icon.src),
      "favicon.ico",
      "apple-touch-icon-180x180.png",
    ];
    const missingFiles = iconFiles.filter(
      (file) => !existsSync(path.join("public", file))
    );
    expect(missingFiles).toEqual([]);
  });
});
