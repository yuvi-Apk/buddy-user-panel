import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { Field, FieldFrame, FieldLabel, type FieldTextProps } from "./field";
import { useFieldIds } from "./use-field-ids";

export interface TextAreaProps
  extends FieldTextProps, Omit<ComponentProps<"textarea">, "required"> {}

/** Longer text, such as a doubt for the tutor or a note to an Organization. */
export function TextArea({
  label,
  hint,
  error,
  isRequired,
  id,
  className,
  rows = 4,
  placeholder,
  disabled,
  ...props
}: TextAreaProps) {
  const ids = useFieldIds(id, { hint, error });

  return (
    <Field
      hint={hint}
      error={error}
      hintId={ids.hintId}
      errorId={ids.errorId}
      className={className}
    >
      <FieldFrame isInvalid={ids.invalid} isDisabled={disabled}>
        <textarea
          id={ids.controlId}
          rows={rows}
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid || undefined}
          // Never empty: CSS uses the placeholder to tell an empty field from a filled one.
          placeholder={placeholder ?? " "}
          required={isRequired}
          disabled={disabled}
          className={cn(
            "peer w-full resize-y bg-transparent px-3 py-2.5 text-base outline-none disabled:cursor-not-allowed",
            "placeholder:text-muted-foreground placeholder:opacity-0 focus:placeholder:opacity-100"
          )}
          {...props}
        />
        {/* Resting on the first line, not in the middle of a tall box. */}
        <FieldLabel
          controlId={ids.controlId}
          label={label}
          isRequired={isRequired}
          className="top-5.5"
        />
      </FieldFrame>
    </Field>
  );
}
