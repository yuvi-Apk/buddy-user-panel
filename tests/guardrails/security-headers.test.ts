// security.md: the CSP and the other headers (security-headers.config.ts), and an index.html the
// CSP can serve: no inline script, nothing from another site.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  contentSecurityPolicy,
  headersFile,
  securityHeaders,
} from "../../security-headers.config";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

function directives(csp: string): Map<string, string[]> {
  return new Map(
    csp.split(";").map((part) => {
      const [name = "", ...values] = part.trim().split(/\s+/);
      return [name, values];
    })
  );
}

describe("Content-Security-Policy", () => {
  const csp = directives(contentSecurityPolicy());

  it("runs only our own scripts: no inline script, no eval, no CDN", () => {
    expect(csp.get("script-src")).toEqual(["'self'"]);
    expect(contentSecurityPolicy()).not.toContain("unsafe-eval");
    expect(csp.get("default-src")).toEqual(["'self'"]);
  });

  it("can never be framed, and blocks plugins and base-tag tricks", () => {
    expect(csp.get("frame-ancestors")).toEqual(["'none'"]);
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
    expect(csp.get("form-action")).toEqual(["'self'"]);
  });

  it("loads fonts, workers and the manifest only from this site", () => {
    expect(csp.get("font-src")).toEqual(["'self'"]);
    expect(csp.get("worker-src")).toEqual(["'self'"]);
    expect(csp.get("manifest-src")).toEqual(["'self'"]);
  });

  it("adds an API on another site to connect-src and img-src only", () => {
    const withApi = directives(
      contentSecurityPolicy({ apiOrigin: "https://api.example.com" })
    );
    expect(withApi.get("connect-src")).toEqual([
      "'self'",
      "https://api.example.com",
    ]);
    expect(withApi.get("img-src")).toContain("https://api.example.com");
    expect(withApi.get("script-src")).toEqual(["'self'"]);
  });

  it("upgrades to https in production, but not on the local preview", () => {
    expect(csp.has("upgrade-insecure-requests")).toBe(true);
    expect(
      directives(contentSecurityPolicy({ local: true })).has(
        "upgrade-insecure-requests"
      )
    ).toBe(false);
  });
});

describe("other headers", () => {
  const headers = securityHeaders();

  it("sends the hardening headers", () => {
    expect(headers).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cross-Origin-Opener-Policy": "same-origin",
    });
    expect(headers["Strict-Transport-Security"]).toMatch(/max-age=\d{8,}/);
    expect(headers["Permissions-Policy"]).toMatch(/camera=\(\)/);
    expect(headers["Permissions-Policy"]).toMatch(/microphone=\(\)/);
    expect(headers["Permissions-Policy"]).toMatch(/geolocation=\(\)/);
  });

  it("leaves HSTS out of the local preview (http)", () => {
    expect(securityHeaders({ local: true })).not.toHaveProperty(
      "Strict-Transport-Security"
    );
  });

  it("dist/_headers puts them on every path and never caches the service worker", () => {
    const file = headersFile();
    expect(file).toMatch(/^\/\*\n {2}Content-Security-Policy: /);
    expect(file).toMatch(/\/sw\.js\n {2}Cache-Control: no-cache/);
    expect(file).toMatch(/\/index\.html\n {2}Cache-Control: no-cache/);
  });
});

describe("index.html", () => {
  const html = readFileSync(path.join(ROOT, "index.html"), "utf8").replace(
    /<!--[\s\S]*?-->/g,
    ""
  );

  it("has no inline script and no inline event handler", () => {
    const scripts = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) ?? [];
    const inline = scripts.filter(
      (tag) => !/\ssrc=/.test(tag) || !/>\s*<\/script>$/.test(tag)
    );
    expect(inline).toEqual([]);
    expect(html).not.toMatch(/\son[a-z]+=/i);
  });

  it("loads nothing from another site", () => {
    expect(html).not.toMatch(/(?:src|href)=["'](?:https?:)?\/\//i);
  });
});
