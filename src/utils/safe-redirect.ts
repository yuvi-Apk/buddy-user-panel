// Where to go after logging in: the `?redirect=` value, but only when it is a path on this site
//. Anything else ("https://evil.example", "//evil.example", "/\\evil.example",
// "javascript:…") gives the fallback, so a link can never send someone to a fake login page.
//
//   navigate(safeRedirect(searchParams.get("redirect"), homeFor(user.role)), { replace: true });

/** A same-site path ("/plan?week=2"), or `fallback` when `value` is anything else. */
export function safeRedirect(
  value: string | null | undefined,
  fallback: string
): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return fallback;
  if (/[\u0000-\u001f\u007f\s]/.test(value)) return fallback;

  try {
    const origin = window.location.origin;
    const url = new URL(value, origin);
    if (url.origin !== origin) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
