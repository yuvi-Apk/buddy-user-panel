import { afterEach, describe, expect, it, vi } from "vitest";
import { setMediaQuery } from "@tests/helpers/media-query";

const DARK = "(prefers-color-scheme: dark)";
const root = document.documentElement;

// The store reads the saved choice when it is first imported, so each test imports a fresh copy.
async function freshStore() {
  vi.resetModules();
  return import("@/theme/theme-store");
}

function save(value: unknown): void {
  window.localStorage.setItem("buddy.theme", JSON.stringify(value));
}

function saved(): unknown {
  return JSON.parse(window.localStorage.getItem("buddy.theme") ?? "null");
}

function themeColor(): string | undefined {
  return document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.content;
}

afterEach(() => {
  root.removeAttribute("data-mode");
  root.removeAttribute("data-accent");
  document.querySelector('meta[name="theme-color"]')?.remove();
});

describe("the theme store", () => {
  it("starts from the saved choice", async () => {
    save({ mode: "dark", accent: "lagoon" });
    const { getTheme } = await freshStore();
    expect(getTheme()).toEqual({
      mode: "dark",
      accent: "lagoon",
      resolvedMode: "dark",
    });
  });

  it("falls back to the defaults for a broken or unknown saved value", async () => {
    window.localStorage.setItem("buddy.theme", "{not json");
    expect((await freshStore()).getTheme()).toEqual({
      mode: "system",
      accent: "indigo-ink",
      resolvedMode: "light",
    });

    save({ mode: "neon", accent: "pink" });
    expect((await freshStore()).getTheme()).toMatchObject({
      mode: "system",
      accent: "indigo-ink",
    });
  });

  it('resolves "system" from the device setting', async () => {
    setMediaQuery(DARK, true);
    const { getTheme } = await freshStore();
    expect(getTheme()).toMatchObject({ mode: "system", resolvedMode: "dark" });
  });

  it("applies the choice to <html> and saves it", async () => {
    const { setAccent, setMode, initializeTheme } = await freshStore();
    initializeTheme();
    expect(root.dataset).toMatchObject({ mode: "light", accent: "indigo-ink" });

    setMode("dark");
    setAccent("orchid");
    expect(root.dataset).toMatchObject({ mode: "dark", accent: "orchid" });
    expect(saved()).toEqual({ mode: "dark", accent: "orchid" });
  });

  it("tells subscribers about every change until they unsubscribe", async () => {
    const { setMode, subscribeToTheme } = await freshStore();
    const listener = vi.fn();
    const unsubscribe = subscribeToTheme(listener);

    setMode("dark");
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    setMode("light");
    expect(listener).toHaveBeenCalledOnce();
  });

  it('follows the device live while the mode is "system", without saving', async () => {
    const { getTheme, initializeTheme } = await freshStore();
    initializeTheme();

    setMediaQuery(DARK, true);
    expect(getTheme().resolvedMode).toBe("dark");
    expect(root.dataset.mode).toBe("dark");
    expect(saved()).toBeNull();
  });

  it("ignores the device once the person picks light or dark", async () => {
    const { getTheme, setMode, initializeTheme } = await freshStore();
    initializeTheme();
    setMode("light");

    setMediaQuery(DARK, true);
    expect(getTheme().resolvedMode).toBe("light");
    expect(root.dataset.mode).toBe("light");
  });

  it("stops following the device when the returned function is called", async () => {
    const { getTheme, initializeTheme } = await freshStore();
    const stop = initializeTheme();
    stop();

    setMediaQuery(DARK, true);
    expect(getTheme().resolvedMode).toBe("light");
  });

  it("gives the phone's status bar the page color of the current mode", async () => {
    // The real colors come from tokens.css; this stands in for it.
    const style = document.createElement("style");
    style.textContent =
      ':root { --background: #f7f6f2; } [data-mode="dark"] { --background: #12131c; }';
    document.head.append(style);
    try {
      const { setMode, initializeTheme } = await freshStore();
      initializeTheme();
      expect(themeColor()).toBe("#f7f6f2");

      setMode("dark");
      expect(themeColor()).toBe("#12131c");
    } finally {
      style.remove();
    }
  });
});
