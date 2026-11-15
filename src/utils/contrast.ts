// WCAG 2 contrast between two opaque colors written as hex ("#4648d4" or "#fff").
// Used by the contrast test, the UI gallery, and (later) to check an Organization's
// brand color before it is used.

/** WCAG AA: 4.5 for normal text, 3 for large text, borders, icons and focus rings. */
export const AA_TEXT = 4.5;
export const AA_UI = 3;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value.trim());
}

/** Relative luminance from 0 (black) to 1 (white). Throws for anything that is not hex. */
export function relativeLuminance(hex: string): number {
  const value = hex.trim();
  if (!HEX.test(value)) throw new Error(`Not a hex color: "${hex}"`);

  const digits =
    value.length === 4
      ? value
          .slice(1)
          .split("")
          .map((digit) => digit + digit)
      : [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)];

  const [red = 0, green = 0, blue = 0] = digits.map((pair) => {
    const channel = Number.parseInt(pair, 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Contrast ratio from 1 (no contrast) to 21 (black on white). Order does not matter. */
export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
