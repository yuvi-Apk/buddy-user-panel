// A yes/no choice with its label. The whole row is at least 44px tall and the label is clickable.
//   <Checkbox label={lang.auth.acceptTerms} checked={accepted} onCheckedChange={setAccepted} />
import { Check } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";

export interface CheckboxProps extends Omit<
  ComponentProps<typeof CheckboxPrimitive.Root>,
  "children"
> {
  label: ReactNode;
  description?: ReactNode;
}

export function Checkbox({
  label,
  description,
  id,
  className,
  ...props
}: CheckboxProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const descriptionId = description ? `${controlId}-description` : undefined;

  return (
    <div
      data-slot="checkbox"
      className={cn("flex min-h-11 items-start gap-3 py-2.5", className)}
    >
      <CheckboxPrimitive.Root
        id={controlId}
        aria-describedby={descriptionId}
        className={cn(
          "peer mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border-2 border-input bg-card text-primary-foreground transition-colors",
          "disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check aria-hidden className="size-4" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className="flex flex-col gap-0.5 peer-disabled:opacity-50">
        <label htmlFor={controlId} className="text-base text-foreground">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
