// public/theme-boot.js runs before the first paint and must apply the same theme the theme store
// saved. It is plain JavaScript that can't import, so this test keeps it in step with
// src/utils/storage.ts (the key) and src/theme/themes.ts (the modes, themes and defaults).
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/utils/storage";
import { ACCENTS, DEFAULT_ACCENT } from "@/theme/themes";

const SCRIPT = readFileSync("public/theme-boot.js", "utf8");
const DARK_QUERY = "(prefers-color-scheme: dark)";

interface Device {
  /** What the theme store saved, as text. */
  saved?: string | null;
  prefersDark?: boolean;
  storageBlocked?: boolean;
}

/** Runs the script against a fake page and returns the attributes it set on <html>. */
function boot({
  saved = null,
  prefersDark = false,
  storageBlocked = false,
}: Device = {}) {
  const attributes = new Map<string, string>();
  const window = {
    localStorage: {
      getItem(key: string) {
        if (storageBlocked) throw new Error("SecurityError");
        return key === STORAGE_KEYS.theme ? saved : null;
      },
    },
    matchMedia: (query: string) => ({
      matches: query === DARK_QUERY && prefersDark,
    }),
  };
  const document = {
    documentElement: {
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
    },
  };
  vm.runInNewContext(SCRIPT, { window, document });
  return {
    mode: attributes.get("data-mode"),
    accent: attributes.get("data-accent"),
  };
}

// The same shape the theme store saves (theme-store.ts, commit()).
const saved = (mode: string, accent: string) =>
  JSON.stringify({ mode, accent });

describe("public/theme-boot.js", () => {
  it("applies every theme and mode the theme store can save", () => {
    for (const accent of ACCENTS) {
      expect(boot({ saved: saved("dark", accent) })).toEqual({
        mode: "dark",
        accent,
      });
      expect(boot({ saved: saved("light", accent) })).toEqual({
        mode: "light",
        accent,
      });
    }
  });

  it('resolves "system" from the device, like the theme store', () => {
    expect(
      boot({ saved: saved("system", "orchid"), prefersDark: true })
    ).toEqual({
      mode: "dark",
      accent: "orchid",
    });
    expect(boot({ prefersDark: false }).mode).toBe("light");
  });

  it("falls back to the defaults for nothing saved, a broken value or blocked storage", () => {
    const defaults = { mode: "light", accent: DEFAULT_ACCENT };
    expect(boot()).toEqual(defaults);
    expect(boot({ saved: "{not json" })).toEqual(defaults);
    expect(boot({ saved: saved("neon", "pink") })).toEqual(defaults);
    expect(
      boot({ saved: saved("dark", "lagoon"), storageBlocked: true })
    ).toEqual(defaults);
  });

  it("is loaded by index.html as a classic script in <head>, so it runs before the first paint", () => {
    const head = /<head>([\s\S]*)<\/head>/.exec(
      readFileSync("index.html", "utf8")
    )?.[1];
    expect(head).toContain('<script src="/theme-boot.js"></script>');
  });
});
