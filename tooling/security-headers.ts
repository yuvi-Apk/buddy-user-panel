// The security headers of the app, defined once:
//   - `pnpm preview` sends them (vite.config.ts), so the production build is checked with them
//   - `pnpm build` writes them to dist/_headers, the format Netlify and Cloudflare Pages read;
//     for another host, copy the same headers into its config
//
// script-src is 'self' only: no inline script, no eval, no CDN. That is
// why public/theme-boot.js is a file and the service worker is registered from the bundle.
//
// style-src also allows inline styles. Radix's dialogs lock page scrolling by adding a small
// <style> tag while they are open; without 'unsafe-inline' that lock silently fails. Inline CSS
// cannot run code, and React never puts untrusted text into styles. Never add more inline styles.

export interface SecurityHeaderOptions {
  /** The API's origin when it is on another site ("https://api.example.com"). */
  apiOrigin?: string;
  /**
   * `pnpm preview` on http://localhost: leaves out HSTS and upgrade-insecure-requests, which only
   * make sense over https (the second would send every request to https://localhost).
   */
  local?: boolean;
}

export function buildContentSecurityPolicy({
  apiOrigin,
  local = false,
}: SecurityHeaderOptions = {}): string {
  const api = apiOrigin ? [apiOrigin] : [];
  const directives: Array<[string, ...string[]]> = [
    ["default-src", "'self'"],
    ["script-src", "'self'"],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", "'self'", "data:", "blob:", ...api],
    ["font-src", "'self'"],
    ["connect-src", "'self'", ...api],
    ["worker-src", "'self'"],
    ["manifest-src", "'self'"],
    ["media-src", "'self'", "blob:"],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
    ["frame-src", "'none'"],
    ["frame-ancestors", "'none'"],
    ...(local ? [] : [["upgrade-insecure-requests"] as [string]]),
  ];
  return directives.map((parts) => parts.join(" ")).join("; ");
}

export function buildSecurityHeaders(
  options: SecurityHeaderOptions = {}
): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(options),
    ...(options.local
      ? {}
      : { "Strict-Transport-Security": "max-age=63072000; includeSubDomains" }),
    "X-Content-Type-Options": "nosniff",
    // Older browsers that don't know frame-ancestors.
    "X-Frame-Options": "DENY",
    // Invite and password-reset links carry secrets; other sites only ever see our origin.
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

/**
 * dist/_headers: the security headers on every path, plus caching. Hashed files in /assets never
 * change, so they are cached for a year; the service worker and the HTML are always checked
 * again, so a new version is found at once.
 */
export function buildHeadersFile(
  options: Omit<SecurityHeaderOptions, "local"> = {}
): string {
  const formatHeaderBlock = (path: string, headers: Record<string, string>) =>
    [
      path,
      ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`),
    ].join("\n");

  const noCache = { "Cache-Control": "no-cache" };
  return [
    formatHeaderBlock("/*", buildSecurityHeaders(options)),
    formatHeaderBlock("/assets/*", {
      "Cache-Control": "public, max-age=31536000, immutable",
    }),
    formatHeaderBlock("/index.html", noCache),
    formatHeaderBlock("/sw.js", noCache),
    formatHeaderBlock("/manifest.webmanifest", noCache),
    "",
  ].join("\n\n");
}
