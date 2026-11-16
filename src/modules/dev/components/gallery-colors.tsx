// Token swatches with their live contrast, for the current theme and mode.
import { Badge } from "@/components/ui";
import {
  MIN_TEXT_CONTRAST,
  MIN_UI_CONTRAST,
  contrastRatio,
  isHexColor,
} from "@/utils/contrast";
import { useTheme } from "@/theme";

interface Pair {
  name: string;
  background: string;
  foreground: string;
  minimum: number;
}

const PAIRS: readonly Pair[] = [
  {
    name: "Text on page",
    background: "background",
    foreground: "foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Muted text on card",
    background: "card",
    foreground: "muted-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Primary button",
    background: "primary",
    foreground: "primary-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Primary hover",
    background: "primary-hover",
    foreground: "primary-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Primary soft",
    background: "primary-soft",
    foreground: "primary-soft-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Link on card",
    background: "card",
    foreground: "primary",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Progress",
    background: "progress",
    foreground: "progress-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Progress soft",
    background: "progress-soft",
    foreground: "progress-soft-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Needs practice",
    background: "weak-soft",
    foreground: "weak-soft-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Needs-practice bar on track",
    background: "muted",
    foreground: "weak",
    minimum: MIN_UI_CONTRAST,
  },
  {
    name: "Error soft",
    background: "destructive-soft",
    foreground: "destructive-soft-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Error button",
    background: "destructive",
    foreground: "destructive-foreground",
    minimum: MIN_TEXT_CONTRAST,
  },
  {
    name: "Field border on card",
    background: "card",
    foreground: "input",
    minimum: MIN_UI_CONTRAST,
  },
  {
    name: "Focus ring on page",
    background: "background",
    foreground: "ring",
    minimum: MIN_UI_CONTRAST,
  },
];

function tokenValue(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
}

export function GalleryColors() {
  // Re-render on every theme change, so the numbers below are read again.
  useTheme();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PAIRS.map((pair) => {
        const background = tokenValue(pair.background);
        const foreground = tokenValue(pair.foreground);
        const ratio =
          isHexColor(background) && isHexColor(foreground)
            ? contrastRatio(background, foreground)
            : 0;
        const passes = ratio >= pair.minimum;

        return (
          <div
            key={pair.name}
            className="flex flex-col overflow-hidden rounded-card border border-border"
          >
            <div
              className="flex h-20 items-center justify-center text-lg font-semibold"
              style={{
                backgroundColor: `var(--${pair.background})`,
                color: `var(--${pair.foreground})`,
              }}
            >
              Aa · {pair.name}
            </div>
            <div className="flex items-center justify-between gap-2 bg-card px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {pair.foreground} on {pair.background}
              </span>
              <Badge variant={passes ? "progress" : "destructive"}>
                {ratio.toFixed(2)}:1 {passes ? "AA" : "fails"}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
