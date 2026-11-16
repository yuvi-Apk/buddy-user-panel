// A short row of options where exactly one is picked: Light · Dark · System.
// It is a radio group, so arrow keys move between the options. One highlight slides to the chosen
// option, so the choice is seen to move.
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type CSSProperties, type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";

export interface SegmentOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface SegmentedControlProps {
  label: ReactNode;
  options: readonly SegmentOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  const labelId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  // Options share the row equally (flex-1), so the highlight's size and place follow from the
  // count: 0.25rem padding on each side and a 0.25rem gap between options.
  const segmentWidth = `calc((100% - 0.5rem - ${options.length - 1} * 0.25rem) / ${options.length})`;
  const highlightStyle: CSSProperties = {
    width: segmentWidth,
    insetInlineStart: `calc(0.25rem + ${Math.max(selectedIndex, 0)} * (${segmentWidth} + 0.25rem))`,
  };

  return (
    <div
      data-slot="segmented-control"
      className={cn("flex flex-col gap-2", className)}
    >
      <p id={labelId} className="text-sm font-semibold text-foreground">
        {label}
      </p>
      <RadioGroupPrimitive.Root
        aria-labelledby={labelId}
        orientation="horizontal"
        value={value}
        onValueChange={onValueChange}
        className="relative flex gap-1 rounded-control bg-muted p-1"
      >
        <span
          aria-hidden
          data-slot="segmented-control-highlight"
          style={highlightStyle}
          className={cn(
            "absolute inset-y-1 rounded-sm bg-primary-soft transition-[inset-inline-start] duration-200 ease-out",
            selectedIndex < 0 && "opacity-0"
          )}
        />
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={cn(
              "relative inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm px-3 text-sm font-semibold text-muted-foreground transition-colors duration-200",
              "hover:text-foreground data-[state=checked]:text-primary-soft-foreground",
              "[&_svg]:size-4"
            )}
          >
            {option.icon ? <span aria-hidden>{option.icon}</span> : null}
            {option.label}
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}
