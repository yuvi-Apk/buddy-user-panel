// A short row of options where exactly one is picked: Light · Dark · System.
// It is a radio group, so arrow keys move between the options.
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ReactNode, useId } from "react";
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
        className="flex gap-1 rounded-control bg-muted p-1"
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm px-3 text-sm font-semibold text-muted-foreground transition-colors",
              "hover:text-foreground data-[state=checked]:bg-primary-soft data-[state=checked]:text-primary-soft-foreground",
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
