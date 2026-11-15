import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safe-redirect";
import { safeUrl } from "./safe-url";

describe("safeUrl", () => {
  it.each([
    ["https://example.com/a?b=1", "https://example.com/a?b=1"],
    ["http://example.com", "http://example.com/"],
    ["mailto:teacher@example.com", "mailto:teacher@example.com"],
    ["tel:+911234567890", "tel:+911234567890"],
  ])("allows %s", (value, expected) => {
    expect(safeUrl(value)).toBe(expected);
  });

  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox",
    "file:///etc/passwd",
    "",
    "   ",
  ])("refuses %j", (value) => {
    expect(safeUrl(value)).toBeUndefined();
  });

  it("refuses missing values", () => {
    expect(safeUrl(null)).toBeUndefined();
    expect(safeUrl(undefined)).toBeUndefined();
  });
});

describe("safeRedirect", () => {
  it.each([
    ["/plan", "/plan"],
    ["/plan?week=2#today", "/plan?week=2#today"],
    ["/organization/classes/abc", "/organization/classes/abc"],
  ])("keeps the same-site path %s", (value, expected) => {
    expect(safeRedirect(value, "/today")).toBe(expected);
  });

  it.each([
    "https://evil.example/login",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "plan",
    "/plan\n",
    "",
  ])("sends %j to the fallback", (value) => {
    expect(safeRedirect(value, "/today")).toBe("/today");
  });

  it("uses the fallback when there is no value", () => {
    expect(safeRedirect(null, "/today")).toBe("/today");
  });
});
