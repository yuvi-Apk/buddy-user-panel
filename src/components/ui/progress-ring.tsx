// A round progress indicator with the percentage in the middle (dashboards, today's plan).
import { fill, useLang } from "@/lang";
import { cn } from "@/lib/cn";
import type { ProgressTone } from "./progress-bar";

const sizes = {
  sm: { box: 48, stroke: 5, text: "text-sm" },
  md: { box: 72, stroke: 7, text: "text-base" },
  lg: { box: 104, stroke: 9, text: "text-xl" },
} as const;

const strokeTone: Record<ProgressTone, string> = {
  primary: "stroke-primary",
  progress: "stroke-progress",
  weak: "stroke-weak",
  destructive: "stroke-destructive",
};

export interface ProgressRingProps {
  label: string;
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: keyof typeof sizes;
  className?: string;
}

export function ProgressRing({
  label,
  value,
  max = 100,
  tone = "progress",
  size = "md",
  className,
}: ProgressRingProps) {
  const lang = useLang();
  const { box, stroke, text } = sizes[size];
  const current = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? Math.round((current / max) * 100) : 0;
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className
      )}
      style={{ width: box, height: box }}
    >
      <svg
        aria-hidden
        width={box}
        height={box}
        viewBox={`0 0 ${box} ${box}`}
        className="-rotate-90"
      >
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className={cn(
            "transition-[stroke-dashoffset] duration-500 ease-out",
            strokeTone[tone]
          )}
        />
      </svg>
      <span
        aria-hidden
        className={cn("absolute font-display font-semibold tabular-nums", text)}
      >
        {fill(lang.ui.percent, { value: percent })}
      </span>
    </div>
  );
}
