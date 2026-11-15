// How far along something is, with its label and the percentage as text (never color alone).
//   <ProgressBar label={lang.plan.weekProgress} value={4} max={7} />
import { useId } from "react";
import { fill, useLang } from "@/lang";
import { cn } from "@/lib/cn";

export type ProgressTone = "primary" | "progress" | "weak" | "destructive";

const fillTone: Record<ProgressTone, string> = {
  primary: "bg-primary",
  progress: "bg-progress",
  weak: "bg-weak",
  destructive: "bg-destructive",
};

export interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  /** `progress` (green) by default. `weak` only for weak topics. */
  tone?: ProgressTone;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({
  label,
  value,
  max = 100,
  tone = "progress",
  showValue = true,
  className,
}: ProgressBarProps) {
  const lang = useLang();
  const labelId = useId();
  const current = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? Math.round((current / max) * 100) : 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span id={labelId} className="font-semibold text-foreground">
          {label}
        </span>
        {showValue ? (
          <span className="text-muted-foreground tabular-nums">
            {fill(lang.ui.percent, { value: percent })}
          </span>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            fillTone[tone]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
