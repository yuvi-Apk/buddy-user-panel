// An on/off setting that takes effect at once ("Daily reminder"). For a choice that is saved with
// a form, use Checkbox instead.
import { Switch as SwitchPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";

export interface SwitchProps extends Omit<
  ComponentProps<typeof SwitchPrimitive.Root>,
  "children"
> {
  label: ReactNode;
  description?: ReactNode;
}

export function Switch({
  label,
  description,
  id,
  className,
  ...props
}: SwitchProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const descriptionId = description ? `${controlId}-description` : undefined;

  return (
    <div
      data-slot="switch"
      className={cn(
        "flex min-h-11 items-center justify-between gap-4 py-2",
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        <label htmlFor={controlId} className="text-base text-foreground">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <SwitchPrimitive.Root
        id={controlId}
        aria-describedby={descriptionId}
        className={cn(
          "inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors",
          "bg-input disabled:opacity-50 data-[state=checked]:bg-primary"
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "block size-5 rounded-full bg-card shadow-card transition-transform duration-150",
            "data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-foreground rtl:data-[state=checked]:-translate-x-5"
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
}
