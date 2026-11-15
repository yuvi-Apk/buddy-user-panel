// src/lang/en.json holds only text, and every other language file has exactly the
// same keys and {placeholders}, so switching language can never show a missing or broken text.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LANGUAGES } from "@/lang";

const LANG_DIR = path.join("src", "lang");
const PLURAL_FORMS = new Set(["zero", "one", "two", "few", "many", "other"]);
const KEY = /^[a-z][a-zA-Z0-9]*$/;

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const read = (code: string): Json =>
  JSON.parse(readFileSync(path.join(LANG_DIR, `${code}.json`), "utf8")) as Json;

const isObject = (value: Json | undefined): value is { [key: string]: Json } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPlural = (value: { [key: string]: Json }) =>
  "one" in value || "other" in value;

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

/** Problems in en.json: anything that is not a text group, a text, or a plural text. */
function checkEnglish(value: Json, at: string, problems: string[]): void {
  if (!isObject(value)) {
    problems.push(`${at}: must be a group of texts`);
    return;
  }
  if (isPlural(value)) {
    if (!("one" in value) || !("other" in value))
      problems.push(`${at}: plural needs one and other`);
    for (const [form, text] of Object.entries(value)) {
      if (!PLURAL_FORMS.has(form))
        problems.push(`${at}.${form}: not a plural form`);
      if (typeof text !== "string" || text.trim() === "")
        problems.push(`${at}.${form}: empty`);
    }
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const childAt = at ? `${at}.${key}` : key;
    if (!KEY.test(key)) problems.push(`${childAt}: keys are camelCase`);
    if (typeof child === "string") {
      if (child.trim() === "") problems.push(`${childAt}: empty text`);
    } else {
      checkEnglish(child, childAt, problems);
    }
  }
}

/** Problems in a translation compared with English. */
function compare(
  english: Json,
  other: Json | undefined,
  at: string,
  problems: string[]
): void {
  if (typeof english === "string") {
    if (typeof other !== "string") {
      problems.push(`${at}: missing`);
    } else if (placeholders(english).join() !== placeholders(other).join()) {
      problems.push(`${at}: placeholders differ from English`);
    }
    return;
  }
  if (!isObject(english)) return;
  if (!isObject(other)) {
    problems.push(`${at}: missing`);
    return;
  }
  if (isPlural(english)) {
    for (const form of ["one", "other"]) {
      if (typeof other[form] !== "string")
        problems.push(`${at}.${form}: missing`);
    }
    for (const [form, text] of Object.entries(other)) {
      if (!PLURAL_FORMS.has(form)) {
        problems.push(`${at}.${form}: not a plural form`);
      } else if (
        typeof text === "string" &&
        typeof english.other === "string" &&
        placeholders(text).join() !== placeholders(english.other).join()
      ) {
        problems.push(`${at}.${form}: placeholders differ from English`);
      }
    }
    return;
  }
  for (const [key, child] of Object.entries(english)) {
    compare(child, other[key], at ? `${at}.${key}` : key, problems);
  }
  for (const key of Object.keys(other)) {
    if (!(key in english))
      problems.push(`${at ? `${at}.` : ""}${key}: not in English`);
  }
}

describe("src/lang", () => {
  it("has one file per language in LANGUAGES, and no other files", () => {
    const files = readdirSync(LANG_DIR)
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.replace(/\.json$/, ""))
      .sort();
    expect(files).toEqual([...LANGUAGES].sort());
  });

  it("en.json holds only non-empty texts with camelCase keys", () => {
    const problems: string[] = [];
    checkEnglish(read("en"), "", problems);
    expect(problems).toEqual([]);
  });

  // Typed as string[]: while English is the only language, the filtered list is empty.
  const otherLanguages: readonly string[] = LANGUAGES.filter(
    (language) => language !== "en"
  );
  for (const code of otherLanguages) {
    it(`${code}.json has exactly the keys and placeholders of en.json`, () => {
      const problems: string[] = [];
      compare(read("en"), read(code), "", problems);
      expect(problems).toEqual([]);
    });
  }
});
