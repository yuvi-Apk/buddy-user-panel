// The 4 themes ("accents") and 3 modes. Their colors live in src/styles/tokens.css, their names
// and moods in src/lang/en.json (theme.accents). public/theme-boot.js lists the same ids;
// tests/guardrails/theme-boot.test.ts keeps the two in step.
import type { Lang } from "@/lang";

export const ACCENTS = ["indigo-ink", "lagoon", "orchid", "graphite"] as const;
export type Accent = (typeof ACCENTS)[number];
export const DEFAULT_ACCENT: Accent = "indigo-ink";

export const MODES = ["light", "dark", "system"] as const;
export type Mode = (typeof MODES)[number];
export const DEFAULT_MODE: Mode = "system";

/** What is on screen: "system" becomes light or dark. */
export type ResolvedMode = Exclude<Mode, "system">;

/** The key of each theme's name, mood and description in en.json (theme.accents). */
export const ACCENT_TEXT_KEY = {
  "indigo-ink": "indigoInk",
  lagoon: "lagoon",
  orchid: "orchid",
  graphite: "graphite",
} as const satisfies Record<Accent, keyof Lang["theme"]["accents"]>;

export function isAccent(value: unknown): value is Accent {
  return (
    typeof value === "string" && (ACCENTS as readonly string[]).includes(value)
  );
}

export function isMode(value: unknown): value is Mode {
  return (
    typeof value === "string" && (MODES as readonly string[]).includes(value)
  );
}
