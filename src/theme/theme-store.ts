// The person's theme choice: a mode (light, dark, system) and an accent (one of the 4 themes).
//
// It is applied to <html data-mode data-accent>, remembered through src/utils/storage.ts, and while
// the mode is "system" it follows the phone's dark-mode setting live. public/theme-boot.js applies
// the same saved choice before the first paint, so the page never flashes the wrong colors.
import { readFromStorage, writeToStorage } from "@/utils/storage";
import {
  type Accent,
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  isAccent,
  isMode,
  type Mode,
  type ResolvedMode,
} from "./themes";

export interface ThemeState {
  mode: Mode;
  accent: Accent;
  /** What is on screen right now ("system" resolved to light or dark). */
  resolvedMode: ResolvedMode;
}

const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

let themeState: ThemeState = createInitialThemeState();
const listeners = new Set<() => void>();

export function getTheme(): ThemeState {
  return themeState;
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setMode(mode: Mode): void {
  updateTheme({ ...themeState, mode, resolvedMode: resolveMode(mode) });
}

export function setAccent(accent: Accent): void {
  updateTheme({ ...themeState, accent });
}

/**
 * Applies the saved choice to the page and follows the system dark-mode setting.
 * Call once when the app starts. Returns a function that stops following.
 */
export function initializeTheme(): () => void {
  applyThemeToDocument(themeState);
  if (typeof window.matchMedia !== "function") return () => {};

  const query = window.matchMedia(DARK_MODE_QUERY);
  const onChange = () => {
    if (themeState.mode === "system") {
      updateTheme(
        { ...themeState, resolvedMode: resolveMode("system") },
        { save: false }
      );
    }
  };
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

// --- internals --------------------------------------------------------------

function createInitialThemeState(): ThemeState {
  const saved = readSavedTheme();
  return { ...saved, resolvedMode: resolveMode(saved.mode) };
}

function readSavedTheme(): Pick<ThemeState, "mode" | "accent"> {
  try {
    const saved: unknown = JSON.parse(readFromStorage("theme") ?? "null");
    if (typeof saved === "object" && saved !== null) {
      const { mode, accent } = saved as Record<string, unknown>;
      return {
        mode: isMode(mode) ? mode : DEFAULT_MODE,
        accent: isAccent(accent) ? accent : DEFAULT_ACCENT,
      };
    }
  } catch {
    // Broken JSON: fall through to the defaults.
  }
  return { mode: DEFAULT_MODE, accent: DEFAULT_ACCENT };
}

function resolveMode(mode: Mode): ResolvedMode {
  if (mode !== "system") return mode;
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia(DARK_MODE_QUERY).matches;
  return prefersDark ? "dark" : "light";
}

function updateTheme(nextThemeState: ThemeState, { save = true } = {}): void {
  themeState = nextThemeState;
  applyThemeToDocument(nextThemeState);
  if (save) {
    writeToStorage(
      "theme",
      JSON.stringify({
        mode: nextThemeState.mode,
        accent: nextThemeState.accent,
      })
    );
  }
  for (const listener of listeners) listener();
}

function applyThemeToDocument({ resolvedMode, accent }: ThemeState): void {
  const root = document.documentElement;
  root.dataset.mode = resolvedMode;
  root.dataset.accent = accent;

  // The phone's status bar and an installed app's title bar take this color. It is read from the
  // tokens, so tokens.css stays the only place with color values.
  const background = getComputedStyle(root)
    .getPropertyValue("--background")
    .trim();
  if (!background) return;
  let meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
  }
  meta.content = background;
}
