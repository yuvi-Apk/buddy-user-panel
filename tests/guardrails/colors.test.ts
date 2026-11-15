// core-rules #1: colors come only from the tokens in src/styles/tokens.css. No color value (hex,
// rgb(), hsl(), oklch(), a named color like "white") and no Tailwind palette class (bg-indigo-600,
// bg-white) anywhere else. Comments may mention colors; tests and test helpers may use them.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const TOKENS_FILE = path.join("src", "styles", "tokens.css");
const SCANNED_DIRS = ["src", "public"];
const SCANNED_FILES = ["index.html", "vite.config.ts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".html"]);

const UTILITIES =
  "bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|inset-ring|outline|fill|stroke|from|via|to|" +
  "decoration|divide|placeholder|caret|accent|shadow|inset-shadow|drop-shadow|text-shadow";
const PALETTES =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|" +
  "blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe";
const NAMED_COLORS =
  "black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|brown|navy|teal|maroon|" +
  "olive|lime|aqua|cyan|magenta|fuchsia|silver|gold|indigo|violet|crimson|tomato|coral|" +
  "salmon|beige|ivory|khaki|lavender|turquoise";

const CHECKS: readonly { what: string; pattern: RegExp }[] = [
  // "&#8217;" is an HTML character, and "#main" a link to an id; neither is a color.
  {
    what: "hex color",
    pattern: /(?<!&)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi,
  },
  {
    what: "color function",
    pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/gi,
  },
  {
    what: "Tailwind palette class",
    pattern: new RegExp(
      `(?<![\\w-])(?:${UTILITIES})-(?:(?:${PALETTES})-(?:50|[1-9]00|950)|black|white)\\b`,
      "g"
    ),
  },
  {
    // text-[red], color: red; and "white" as a whole string (a style or an icon's color prop).
    what: "named color",
    pattern: new RegExp(
      `(?:\\[|:\\s*|["'\`])(?:${NAMED_COLORS})(?:\\]|\\s*[;}!]|["'\`])`,
      "gi"
    ),
  },
];

/** Blanks out comments, keeping line numbers. "://" in URLs is not a comment. */
function withoutComments(source: string): string {
  const blank = (text: string) => text.replace(/[^\n]/g, " ");
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(
      /(^|[^:\\])(\/\/.*)$/gm,
      (_, before: string, comment: string) => before + blank(comment)
    );
}

/** Every color value or palette class in the source, as "line: what: text". */
function findColors(source: string): string[] {
  const hits: string[] = [];
  withoutComments(source)
    .split("\n")
    .forEach((line, index) => {
      for (const { what, pattern } of CHECKS) {
        for (const match of line.matchAll(pattern)) {
          hits.push(`${index + 1}: ${what}: ${match[0].trim()}`);
        }
      }
    });
  return hits;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const isTest = (file: string) =>
  /\.test\.tsx?$/.test(file) ||
  file.startsWith(path.join("src", "test") + path.sep);

const files = [...SCANNED_DIRS.flatMap(walk), ...SCANNED_FILES].filter(
  (file) =>
    EXTENSIONS.has(path.extname(file)) && file !== TOKENS_FILE && !isTest(file)
);

describe("colors live only in tokens.css (core-rules #1)", () => {
  it("scans the app", () => {
    expect(files).toContain(path.join("src", "styles", "index.css"));
    expect(files).toContain(path.join("public", "theme-boot.js"));
    expect(files).not.toContain(TOKENS_FILE);
  });

  it("finds no color value or palette class outside tokens.css", () => {
    const hits = files.flatMap((file) =>
      findColors(readFileSync(file, "utf8")).map((hit) => `${file}:${hit}`)
    );
    expect(
      hits,
      "Use a token instead: bg-primary, text-muted-foreground, border-input… (see design-system.md)"
    ).toEqual([]);
  });

  it("catches each kind of color", () => {
    const bad = [
      'className="bg-indigo-600"',
      'className="hover:text-white"',
      'className="border-x-slate-950"',
      'className="bg-black/50"',
      'className="text-[#ff0000]"',
      'className="bg-[red]"',
      "color: #fff;",
      "color: rgb(0 0 0 / 0.5);",
      "fill: oklch(0.7 0.1 250);",
      "background: white;",
      'style={{ color: "red" }}',
      '<Sun color="gold" />',
    ];
    for (const sample of bad) {
      expect(findColors(sample), sample).not.toEqual([]);
    }
  });

  it("allows tokens, ids, HTML characters, URLs and comments", () => {
    const fine = [
      'className="bg-primary text-primary-foreground"',
      'className="border-progress/30 bg-weak-soft text-weak-soft-foreground"',
      'className="whitespace-nowrap from-bottom"',
      "background-color: var(--color-background);",
      "white-space: nowrap;",
      '<a href="#main-content">',
      "It&#8217;s",
      'accent: "indigo-ink"',
      "fill: currentColor; stroke: transparent;",
      'const url = "https://example.com/a#b";',
      "// A comment may say #ff0000 or bg-white.",
      "/* tokens.css holds #4648d4 */",
    ];
    for (const sample of fine) {
      expect(findColors(sample), sample).toEqual([]);
    }
  });
});
