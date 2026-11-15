// A choice from a list. It is the browser's own select, so phones show their native picker,
// which is the easiest to use with a thumb and with a screen reader.
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { Field, type FieldTextProps } from "./field";
import { useFieldIds } from "./use-field-ids";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends FieldTextProps, Omit<ComponentProps<"select">, "children"> {
  options: readonly SelectOption[];
  /** Shown first, until something is chosen ("Choose your exam"). */
  placeholder?: string;
}

export function SelectField({
  label,
  hint,
  error,
  required,
  id,
  className,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
  const ids = useFieldIds(id, { hint, error });

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      controlId={ids.controlId}
      hintId={ids.hintId}
      errorId={ids.errorId}
      className={className}
    >
      <div className="relative">
        <select
          id={ids.controlId}
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid || undefined}
          required={required}
          className={cn(
            "h-11 w-full appearance-none rounded-control border bg-card ps-3 pe-10 text-base text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:opacity-50",
            ids.invalid ? "border-destructive" : "border-input"
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </Field>
  );
}
