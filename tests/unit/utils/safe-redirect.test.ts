import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/utils/safe-redirect";

describe("getSafeRedirectPath", () => {
  it.each([
    ["/plan", "/plan"],
    ["/plan?week=2#today", "/plan?week=2#today"],
    ["/organization/classes/abc", "/organization/classes/abc"],
  ])("keeps the same-site path %s", (value, expected) => {
    expect(getSafeRedirectPath(value, "/today")).toBe(expected);
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
    expect(getSafeRedirectPath(value, "/today")).toBe("/today");
  });

  it("uses the fallback when there is no value", () => {
    expect(getSafeRedirectPath(null, "/today")).toBe("/today");
  });
});
