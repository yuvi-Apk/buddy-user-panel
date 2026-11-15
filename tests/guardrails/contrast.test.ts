// core-rules #3: every theme × mode passes WCAG AA. Text needs 4.5:1; field borders, bars, icons
// and focus rings need 3:1.
//
// The pairs below are the ones the components use. When a component puts a token on a new
// background, add that pair here.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AA_TEXT, AA_UI, contrastRatio, isHexColor } from "@/lib/contrast";
import { ACCENTS, type ResolvedMode } from "@/theme/themes";
import {
  parseTokenRules,
  readTokensCss,
  tokensFor,
} from "../../tooling/design-tokens.ts";

const rules = parseTokenRules(readTokensCss());
const MODES = ["light", "dark"] as const satisfies readonly ResolvedMode[];
const THEMES = MODES.flatMap((mode) =>
  ACCENTS.map((accent) => ({ mode, accent }))
);

const SURFACES = ["background", "card", "popover"];
const PANELS = [...SURFACES, "muted"];
const FAMILIES = ["primary", "progress", "weak", "destructive"];

type Pair = readonly [foreground: string, background: string];

const TEXT_PAIRS: readonly Pair[] = [
  ...[...PANELS, "hover", "primary-soft"].map(
    (bg) => ["foreground", bg] as const
  ),
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ...[...PANELS, "hover", "primary-soft"].map(
    (bg) => ["muted-foreground", bg] as const
  ),
  ...FAMILIES.flatMap((family): Pair[] => [
    [`${family}-foreground`, family],
    [`${family}-soft-foreground`, `${family}-soft`],
    ["foreground", `${family}-soft`],
    ...SURFACES.map((bg) => [`${family}-soft-foreground`, bg] as const),
  ]),
  ["primary-foreground", "primary-hover"],
  ["destructive-foreground", "destructive-hover"],
  // Links and other primary-colored text.
  ...PANELS.map((bg) => ["primary", bg] as const),
  ["brand-foreground", "brand"],
];

const UI_PAIRS: readonly Pair[] = [
  // Field borders and the switch track.
  ...PANELS.map((bg) => ["input", bg] as const),
  // The keyboard focus ring.
  ...PANELS.map((bg) => ["ring", bg] as const),
  // Bars, icons and checked controls, on any surface or a bar's muted track.
  ...FAMILIES.flatMap((family) => PANELS.map((bg) => [family, bg] as const)),
];

function failures(pairs: readonly Pair[], minimum: number): string[] {
  return THEMES.flatMap(({ mode, accent }) => {
    const tokens = tokensFor(rules, {
      "data-mode": mode,
      "data-accent": accent,
    });
    return pairs.flatMap(([foreground, background]) => {
      const where = `${mode} · ${accent}: ${foreground} on ${background}`;
      const fg = tokens.get(`--${foreground}`);
      const bg = tokens.get(`--${background}`);
      if (!fg || !bg) return [`${where}: token missing`];
      if (!isHexColor(fg) || !isHexColor(bg)) {
        return [
          `${where}: use opaque hex colors, so the contrast can be checked`,
        ];
      }
      const ratio = contrastRatio(fg, bg);
      return ratio >= minimum
        ? []
        : [`${where} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`];
    });
  });
}

describe("color contrast in every theme × mode (WCAG AA)", () => {
  it(`text is at least ${AA_TEXT}:1`, () => {
    expect(failures(TEXT_PAIRS, AA_TEXT)).toEqual([]);
  });

  it(`borders, bars, icons and focus rings are at least ${AA_UI}:1`, () => {
    expect(failures(UI_PAIRS, AA_UI)).toEqual([]);
  });
});

describe("tokens.css", () => {
  it("defines every token index.css maps to a Tailwind utility, in every theme × mode", () => {
    // The `@theme inline { --color-primary: var(--primary); … }` block is the mapping.
    const mapping =
      /@theme inline\s*\{([^}]*)\}/.exec(
        readFileSync("src/styles/index.css", "utf8")
      )?.[1] ?? "";
    const used = [
      ...new Set(
        [...mapping.matchAll(/var\((--[\w-]+)\)/g)].map(([, name = ""]) => name)
      ),
    ];

    const missing = THEMES.flatMap(({ mode, accent }) => {
      const tokens = tokensFor(rules, {
        "data-mode": mode,
        "data-accent": accent,
      });
      return used
        .filter((name) => !tokens.has(name))
        .map((name) => `${mode} · ${accent}: ${name}`);
    });
    expect(used.length).toBeGreaterThan(20);
    expect(missing).toEqual([]);
  });

  it("has a light and a dark rule for each theme in themes.ts, and no other theme", () => {
    const selectors = rules.map((rule) => rule.selector);
    const themesInCss = new Set(
      selectors.flatMap((selector) =>
        [...selector.matchAll(/\[data-accent="([^"]*)"\]/g)].map(
          ([, accent = ""]) => accent
        )
      )
    );
    expect([...themesInCss].sort()).toEqual([...ACCENTS].sort());

    for (const accent of ACCENTS) {
      expect(selectors).toContain(`[data-accent="${accent}"]`);
      expect(selectors).toContain(
        `[data-mode="dark"][data-accent="${accent}"]`
      );
    }
  });
});
