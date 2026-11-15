// A topic and how the student is doing with it: "Algebra · Needs practice".
// Always an icon and a word as well as the color, for color-blind students.
// "Needs practice" uses the growth sprout, never a warning sign: weak topics are where growth is.
import { Sprout, TrendingUp } from "lucide-react";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";

export type TopicStrength = "strong" | "needs-practice";

export interface TopicChipProps {
  name: string;
  strength: TopicStrength;
  className?: string;
}

export function TopicChip({ name, strength, className }: TopicChipProps) {
  const lang = useLang();
  const strong = strength === "strong";
  const Icon = strong ? TrendingUp : Sprout;

  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1 text-sm",
        strong
          ? "border-progress/30 bg-progress-soft"
          : "border-weak/40 bg-weak-soft",
        className
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-4 shrink-0",
          strong ? "text-progress-soft-foreground" : "text-weak-soft-foreground"
        )}
      />
      <span className="font-semibold text-foreground">{name}</span>
      <span
        aria-hidden
        className={
          strong ? "text-progress-soft-foreground" : "text-weak-soft-foreground"
        }
      >
        ·
      </span>
      <span
        className={
          strong ? "text-progress-soft-foreground" : "text-weak-soft-foreground"
        }
      >
        {strong ? lang.ui.topicStrong : lang.ui.topicNeedsPractice}
      </span>
    </span>
  );
}
