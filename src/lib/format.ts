// Dates and numbers in the chosen language (Intl), so "15 Nov 2026" and "1,20,000" follow the
// person's language and never get typed by hand.
//
//   formatDate(plan.examDate)                       → "15 Nov 2026"
//   formatDate(message.sentAt, { timeStyle: "short" })
//   formatNumber(0.82, { style: "percent" })        → "82%"
import { getLanguage } from "@/lang";

const dateFormats = new Map<string, Intl.DateTimeFormat>();
const numberFormats = new Map<string, Intl.NumberFormat>();

function cached<T>(
  cache: Map<string, T>,
  options: object,
  create: (language: string) => T
): T {
  const language = getLanguage();
  const key = `${language}|${JSON.stringify(options)}`;
  let format = cache.get(key);
  if (!format) {
    format = create(language);
    cache.set(key, format);
  }
  return format;
}

/** A date from the API (an ISO string) or a Date. An invalid date gives an empty string. */
export function formatDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return cached(
    dateFormats,
    options,
    (language) => new Intl.DateTimeFormat(language, options)
  ).format(date);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return cached(
    numberFormats,
    options,
    (language) => new Intl.NumberFormat(language, options)
  ).format(value);
}
