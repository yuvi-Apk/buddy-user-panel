// A number with its label, and an optional trend line ("+12% this week").
// A falling trend is shown calmly in muted ink: never red, never amber.
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface StatTrend {
  direction: "up" | "down" | "flat";
  text: ReactNode;
}

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  trend?: StatTrend;
  className?: string;
}

const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;

export function Stat({ label, value, trend, className }: StatProps) {
  const TrendIcon = trend ? trendIcon[trend.direction] : null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-semibold text-foreground tabular-nums">
        {value}
      </p>
      {trend && TrendIcon ? (
        <p
          className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            trend.direction === "up"
              ? "text-progress-soft-foreground"
              : "text-muted-foreground"
          )}
        >
          <TrendIcon aria-hidden className="size-4" />
          {trend.text}
        </p>
      ) : null}
    </div>
  );
}
