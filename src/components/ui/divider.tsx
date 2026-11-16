import { Separator as SeparatorPrimitive } from "radix-ui";
import { cn } from "@/utils/cn";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  /** True (default) when it is only a visual line. False when it separates content for meaning. */
  decorative?: boolean;
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  decorative = true,
  className,
}: DividerProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="divider"
      orientation={orientation}
      decorative={decorative}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className
      )}
    />
  );
}
