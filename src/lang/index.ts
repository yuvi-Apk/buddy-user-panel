// All screen text.
//
//   const lang = useLang();
//   <h1>{lang.auth.loginTitle}</h1>
//   fill(lang.home.greeting, { name })   →  "Hi Asha, ready to study?"
//   plural(lang.plan.daysLeft, days)     →  "1 day left" / "12 days left"
//
// en.json is the source of truth: its shape is the type of `lang`, so a missing or misspelled key
// is a TypeScript error. Another language has the same keys in its own file; any value it lacks
// falls back to English. Only the chosen language's file is downloaded.
import { useSyncExternalStore } from "react";
import en from "./en.json";

export type Lang = typeof en;

/** Text that depends on a number: { "one": "{count} day left", "other": "{count} days left" }. */
export interface PluralText {
  /** Used when the count is 0, if present ("No topics yet"). */
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export type TextValues = Record<string, string | number>;

/** The dotted path of one sentence in en.json: "nav.today", "theme.accents.lagoon.name". */
export type LangKey = KeysOf<Lang>;

type KeysOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${KeysOf<T[K]>}`;
}[keyof T & string];

/**
 * The sentence at a dotted key, for config that names its text (route titles, nav labels).
 * In components, prefer `lang.nav.today`: Ctrl+click then opens the exact line in en.json.
 */
export function textAt(lang: Lang, key: LangKey): string {
  let value: unknown = lang;
  for (const part of key.split(".")) {
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === "string" ? value : key;
}

/** Every language the app can show. */
export const LANGUAGES = ["en"] as const;
export type LanguageCode = (typeof LANGUAGES)[number];

// Languages other than English load on demand, one line each:
//   hi: () => import("./hi.json").then((file) => file.default),
const loaders: Partial<Record<LanguageCode, () => Promise<unknown>>> = {};

const loaded: Partial<Record<LanguageCode, Lang>> = { en };
let current: LanguageCode = "en";
const listeners = new Set<() => void>();

/** The text of the current language, for code outside components (for example error messages). */
export function getLang(): Lang {
  return loaded[current] ?? en;
}

export function getLanguage(): LanguageCode {
  return current;
}

/** The text of the current language. The component re-renders when the language changes. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

/** Switches the language, loading its file first if needed. Also sets <html lang>. */
export async function setLanguage(code: LanguageCode): Promise<void> {
  if (!loaded[code]) {
    const load = loaders[code];
    if (!load) {
      throw new Error(`No text file is registered for the language "${code}".`);
    }
    loaded[code] = withEnglishFallback(await load());
  }
  current = code;
  document.documentElement.lang = code;
  for (const listener of listeners) listener();
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return (
    typeof value === "string" &&
    (LANGUAGES as readonly string[]).includes(value)
  );
}

/** Puts values into {placeholders}. A placeholder without a value stays visible, so it gets noticed. */
export function fill(text: string, values: TextValues): string {
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) return placeholder;
    return typeof value === "number" ? formatNumber(value) : value;
  });
}

/** Picks the right form for the count, then fills {count} and any other values. */
export function plural(
  text: PluralText,
  count: number,
  values: TextValues = {}
): string {
  const form =
    count === 0 && text.zero !== undefined
      ? text.zero
      : (text[pluralRules().select(count)] ?? text.other);
  return fill(form, { ...values, count });
}

/**
 * Builds a full text object from another language's file: every value the file has replaces the
 * English one; anything missing, empty or of the wrong kind stays English. Extra keys are ignored.
 */
export function withEnglishFallback(translation: unknown): Lang {
  const english: TextTree = en;
  return mergeText(english, translation) as Lang;
}

// --- internals --------------------------------------------------------------

interface TextTree {
  [key: string]: string | TextTree;
}

function isTextTree(value: unknown): value is TextTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeText(base: TextTree, translation: unknown): TextTree {
  const source = isTextTree(translation) ? translation : {};
  const result: TextTree = {};
  for (const [key, baseValue] of Object.entries(base)) {
    const value = source[key];
    if (typeof baseValue === "string") {
      result[key] =
        typeof value === "string" && value.trim() !== "" ? value : baseValue;
    } else {
      result[key] = mergeText(baseValue, value);
    }
  }
  return result;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const pluralRulesByLanguage = new Map<LanguageCode, Intl.PluralRules>();
function pluralRules(): Intl.PluralRules {
  let rules = pluralRulesByLanguage.get(current);
  if (!rules) {
    rules = new Intl.PluralRules(current);
    pluralRulesByLanguage.set(current, rules);
  }
  return rules;
}

const numberFormatByLanguage = new Map<LanguageCode, Intl.NumberFormat>();
function formatNumber(value: number): string {
  let format = numberFormatByLanguage.get(current);
  if (!format) {
    format = new Intl.NumberFormat(current);
    numberFormatByLanguage.set(current, format);
  }
  return format.format(value);
}
