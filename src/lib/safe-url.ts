// Links built from data (an Organization's website, a link in an AI answer) go through safeUrl()
// first (core-rules #11), so a `javascript:` or `data:` link can never run code.
//
//   const href = safeUrl(resource.url);
//   {href ? <a href={href}>…</a> : <span>…</span>}
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/** The link as a full URL when it is http, https, mailto or tel; otherwise undefined. */
export function safeUrl(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  // Control characters and spaces inside a URL are a common way to sneak past checks.
  if (trimmed === "" || /[\u0000-\u001f\u007f\s]/.test(trimmed))
    return undefined;

  try {
    const url = new URL(trimmed, window.location.origin);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
