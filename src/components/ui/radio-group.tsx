// One choice out of a few, all visible at once. For many options use SelectField; for big
// options with a picture or a description use ChoiceCardGroup.
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";
import { FieldError } from "./field";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<
  ComponentProps<typeof RadioGroupPrimitive.Root>,
  "children"
> {
  label: ReactNode;
  options: readonly RadioOption[];
  hint?: ReactNode;
  error?: ReactNode;
}

export function RadioGroup({
  label,
  options,
  hint,
  error,
  className,
  ...props
}: RadioGroupProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p id={labelId} className="text-sm font-semibold text-foreground">
        {label}
      </p>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <RadioGroupPrimitive.Root
        aria-labelledby={labelId}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        aria-invalid={error ? true : undefined}
        className="flex flex-col"
        {...props}
      >
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          return (
            <div
              key={option.value}
              className="flex min-h-11 items-start gap-3 py-2.5"
            >
              <RadioGroupPrimitive.Item
                id={optionId}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "peer mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-input bg-card transition-colors",
                  "disabled:opacity-50 data-[state=checked]:border-primary"
                )}
              >
                <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-primary" />
              </RadioGroupPrimitive.Item>
              <div className="flex flex-col gap-0.5 peer-disabled:opacity-50">
                <label htmlFor={optionId} className="text-base text-foreground">
                  {option.label}
                </label>
                {option.description ? (
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </RadioGroupPrimitive.Root>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
