// A choice from a list. It is the browser's own select, so phones show their native picker,
// which is the easiest to use with a thumb and with a screen reader.
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { Field, FieldFrame, FieldLabel, type FieldTextProps } from "./field";
import { useFieldIds } from "./use-field-ids";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends
    FieldTextProps,
    Omit<ComponentProps<"select">, "children" | "required"> {
  options: readonly SelectOption[];
  /** Shown first, until something is chosen ("Choose your exam"). */
  placeholder?: string;
}

export function SelectField({
  label,
  hint,
  error,
  isRequired,
  id,
  className,
  options,
  placeholder,
  disabled,
  ...props
}: SelectFieldProps) {
  const ids = useFieldIds(id, { hint, error });

  return (
    <Field
      hint={hint}
      error={error}
      hintId={ids.hintId}
      errorId={ids.errorId}
      className={className}
    >
      <FieldFrame
        isInvalid={ids.invalid}
        isDisabled={disabled}
        className="h-11"
      >
        <select
          data-slot="select"
          id={ids.controlId}
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid || undefined}
          required={isRequired}
          disabled={disabled}
          className="h-full w-full appearance-none bg-card ps-3 pe-10 text-base text-foreground outline-none disabled:cursor-not-allowed"
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
        {/* A select always shows a choice, so its label stays on the border. */}
        <FieldLabel
          controlId={ids.controlId}
          label={label}
          isRequired={isRequired}
          isAlwaysRaised
        />
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        />
      </FieldFrame>
    </Field>
  );
}
