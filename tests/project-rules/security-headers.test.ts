// The few security-header promises that must never be loosened by accident
// (tooling/security-headers.ts), and an index.html the CSP can serve.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "../../tooling/security-headers";

describe("Content-Security-Policy", () => {
  const policy = contentSecurityPolicy({
    apiOrigin: "https://api.example.com",
  });

  it("runs only our own scripts: no inline script, no eval, no other site", () => {
    expect(policy).toContain("script-src 'self';");
    expect(policy).not.toContain("unsafe-eval");
  });

  it("can never be shown inside another site", () => {
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("lets the app call an API on another site", () => {
    expect(policy).toContain("connect-src 'self' https://api.example.com");
  });
});

describe("index.html", () => {
  const html = readFileSync("index.html", "utf8").replace(
    /<!--[\s\S]*?-->/g,
    ""
  );

  it("has no inline script, which the CSP would block", () => {
    const scriptTags = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) ?? [];
    const inlineScripts = scriptTags.filter(
      (tag) => !/\ssrc=/.test(tag) || !/>\s*<\/script>$/.test(tag)
    );
    expect(inlineScripts).toEqual([]);
  });

  it("loads nothing from another site", () => {
    expect(html).not.toMatch(/(?:src|href)=["'](?:https?:)?\/\//i);
  });
});
