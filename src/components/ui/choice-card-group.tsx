// One choice out of a few big options, each a card with a title, a description and an optional
// picture: the theme picker, the exam category in onboarding.
import { CircleCheck } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";

export interface ChoiceCardOption {
  value: string;
  title: ReactNode;
  description?: ReactNode;
  /** Shown at the start of the card: an icon or a small preview. */
  media?: ReactNode;
}

export interface ChoiceCardGroupProps extends Omit<
  ComponentProps<typeof RadioGroupPrimitive.Root>,
  "children"
> {
  label: ReactNode;
  options: readonly ChoiceCardOption[];
  /** 1 on phones; 2 from tablets up. */
  columns?: 1 | 2;
}

export function ChoiceCardGroup({
  label,
  options,
  columns = 2,
  className,
  ...props
}: ChoiceCardGroupProps) {
  const labelId = useId();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p id={labelId} className="text-sm font-semibold text-foreground">
        {label}
      </p>
      <RadioGroupPrimitive.Root
        aria-labelledby={labelId}
        className={cn(
          "grid grid-cols-1 gap-3",
          columns === 2 && "md:grid-cols-2"
        )}
        {...props}
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={cn(
              "group flex min-h-11 items-start gap-3 rounded-card border-2 border-border bg-card p-4 text-start transition-colors",
              "hover:bg-hover disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary-soft"
            )}
          >
            {option.media ? (
              <span aria-hidden className="shrink-0">
                {option.media}
              </span>
            ) : null}
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="font-semibold text-foreground">
                {option.title}
              </span>
              {option.description ? (
                <span className="text-sm text-muted-foreground group-data-[state=checked]:text-primary-soft-foreground">
                  {option.description}
                </span>
              ) : null}
            </span>
            <CircleCheck
              aria-hidden
              className="size-5 shrink-0 text-primary opacity-0 group-data-[state=checked]:opacity-100"
            />
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}
