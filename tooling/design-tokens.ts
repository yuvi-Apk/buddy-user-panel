// Reads src/styles/tokens.css, the only file with color values (core-rules #1), and works out the
// value of every token for one mode and theme, the way the browser's cascade does.
// Used by tests/guardrails/contrast.test.ts, and by config that needs a token's value.
//
// It understands only what tokens.css may contain: plain rules on `:root` and
// `[data-mode="…"]` / `[data-accent="…"]` attribute selectors, declarations, and var(). Anything
// else (nesting, @media, other selectors) is an error, so the file stays simple enough to check.
import { readFileSync } from "node:fs";

export const TOKENS_FILE = new URL("../src/styles/tokens.css", import.meta.url);

export interface TokenRule {
  selector: string;
  declarations: ReadonlyMap<string, string>;
}

/** The attributes on <html>, for example { "data-mode": "dark", "data-accent": "lagoon" }. */
export type HtmlAttributes = Readonly<Record<string, string>>;

interface Compound {
  root: boolean;
  attributes: readonly (readonly [name: string, value: string])[];
}

const RULE = /([^{}]+)\{([^{}]*)\}/g;
const COMPOUND = /^(:root)?((?:\[[a-z-]+="[^"]*"\])*)$/;
const ATTRIBUTE = /\[([a-z-]+)="([^"]*)"\]/g;
const VAR = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/;

export function readTokensCss(): string {
  return readFileSync(TOKENS_FILE, "utf8");
}

export function parseTokenRules(css: string): TokenRule[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  if (source.includes("@")) {
    throw new Error("tokens.css may not use at-rules (@media, @supports, …).");
  }
  const leftover = source.replace(RULE, "").trim();
  if (leftover) {
    throw new Error(
      `tokens.css has something this reader can't follow (nesting?): "${leftover.slice(0, 60)}"`
    );
  }

  return [...source.matchAll(RULE)].map(([, selector = "", body = ""]) => {
    parseSelector(selector); // throws for a selector the cascade below can't handle
    const declarations = new Map<string, string>();
    for (const part of body.split(";")) {
      if (!part.trim()) continue;
      const colon = part.indexOf(":");
      if (colon === -1) {
        throw new Error(`Not a declaration in tokens.css: "${part.trim()}"`);
      }
      const name = part.slice(0, colon).trim();
      const value = part
        .slice(colon + 1)
        .trim()
        .replace(/\s+/g, " ");
      declarations.set(name, value);
    }
    return { selector: selector.trim().replace(/\s+/g, " "), declarations };
  });
}

/**
 * Every token's value on <html> with these attributes: the matching rules applied from the
 * least to the most specific (then in file order), with var() references resolved.
 */
export function tokensFor(
  rules: readonly TokenRule[],
  attributes: HtmlAttributes
): Map<string, string> {
  const applied = rules
    .map((rule, order) => ({
      rule,
      order,
      specificity: Math.max(
        -1,
        ...parseSelector(rule.selector)
          .filter((compound) => matches(compound, attributes))
          .map(specificityOf)
      ),
    }))
    .filter(({ specificity }) => specificity >= 0)
    .sort((a, b) => a.specificity - b.specificity || a.order - b.order);

  const declared = new Map<string, string>();
  for (const { rule } of applied) {
    for (const [name, value] of rule.declarations) declared.set(name, value);
  }

  const resolved = new Map<string, string>();
  for (const name of declared.keys()) {
    resolved.set(name, resolve(name, declared, []));
  }
  return resolved;
}

// --- internals --------------------------------------------------------------

function parseSelector(selector: string): Compound[] {
  return selector.split(",").map((part) => {
    const compound = part.trim();
    const match = COMPOUND.exec(compound);
    if (!compound || !match) {
      throw new Error(
        `tokens.css selectors are :root and [data-…="…"] only, not "${compound}".`
      );
    }
    const attributes = [...(match[2] ?? "").matchAll(ATTRIBUTE)].map(
      ([, name = "", value = ""]) => [name, value] as const
    );
    return { root: Boolean(match[1]), attributes };
  });
}

function matches(compound: Compound, attributes: HtmlAttributes): boolean {
  return compound.attributes.every(
    ([name, value]) => attributes[name] === value
  );
}

function specificityOf(compound: Compound): number {
  return (compound.root ? 1 : 0) + compound.attributes.length;
}

function resolve(
  name: string,
  declared: ReadonlyMap<string, string>,
  seen: readonly string[]
): string {
  if (seen.includes(name)) {
    throw new Error(
      `tokens.css has a var() loop: ${[...seen, name].join(" → ")}`
    );
  }
  let value = declared.get(name);
  if (value === undefined) {
    throw new Error(`tokens.css uses ${name}, but never defines it.`);
  }
  for (let match = VAR.exec(value); match; match = VAR.exec(value)) {
    const [whole, reference = "", fallback] = match;
    const replacement = declared.has(reference)
      ? resolve(reference, declared, [...seen, name])
      : fallback?.trim();
    if (replacement === undefined) {
      throw new Error(`tokens.css uses ${reference}, but never defines it.`);
    }
    value = value.replace(whole, replacement);
  }
  return value;
}
