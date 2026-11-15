import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import en from "./en.json";
import {
  fill,
  getLang,
  getLanguage,
  isLanguageCode,
  plural,
  setLanguage,
  useLang,
  withEnglishFallback,
} from "./index";

describe("useLang / getLang", () => {
  it("gives the English text by default", () => {
    const { result } = renderHook(() => useLang());
    expect(result.current).toBe(en);
    expect(getLang().common.appName).toBe(en.common.appName);
    expect(getLanguage()).toBe("en");
  });

  it("setLanguage sets <html lang>", async () => {
    document.documentElement.lang = "";
    await setLanguage("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("isLanguageCode accepts only registered languages", () => {
    expect(isLanguageCode("en")).toBe(true);
    expect(isLanguageCode("xx")).toBe(false);
    expect(isLanguageCode(42)).toBe(false);
  });
});

describe("fill", () => {
  it("puts values into placeholders", () => {
    expect(fill("Hi {name}, ready to study?", { name: "Asha" })).toBe(
      "Hi Asha, ready to study?"
    );
  });

  it("formats numbers for the current language", () => {
    expect(fill("{count} points", { count: 12500 })).toBe("12,500 points");
  });

  it("leaves a placeholder without a value visible", () => {
    expect(fill("Hi {name}", {})).toBe("Hi {name}");
  });
});

describe("plural", () => {
  const daysLeft = { one: "{count} day left", other: "{count} days left" };

  it("picks the form for the count", () => {
    expect(plural(daysLeft, 1)).toBe("1 day left");
    expect(plural(daysLeft, 3)).toBe("3 days left");
    expect(plural(daysLeft, 0)).toBe("0 days left");
  });

  it("uses the zero form for 0 when there is one", () => {
    expect(plural({ ...daysLeft, zero: "Exam day!" }, 0)).toBe("Exam day!");
  });

  it("fills other values too", () => {
    const text = {
      one: "{count} topic in {subject}",
      other: "{count} topics in {subject}",
    };
    expect(plural(text, 2, { subject: "Physics" })).toBe("2 topics in Physics");
  });
});

describe("withEnglishFallback", () => {
  it("uses the translated values it has", () => {
    const merged = withEnglishFallback({ common: { appName: "बडी" } });
    expect(merged.common.appName).toBe("बडी");
  });

  it("keeps English for missing, empty or wrong values and ignores extra keys", () => {
    const merged = withEnglishFallback({
      common: { appName: "  ", extra: "ignored" },
      app: 42,
    });
    expect(merged).toEqual(en);
  });

  it("keeps all of English when the file is not an object", () => {
    expect(withEnglishFallback(null)).toEqual(en);
    expect(withEnglishFallback(["x"])).toEqual(en);
  });
});
