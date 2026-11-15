import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { Field, type FieldTextProps } from "./field";
import { useFieldIds } from "./use-field-ids";

export interface TextAreaProps
  extends FieldTextProps, ComponentProps<"textarea"> {}

/** Longer text, such as a doubt for the tutor or a note to an Organization. */
export function TextArea({
  label,
  hint,
  error,
  required,
  id,
  className,
  rows = 4,
  ...props
}: TextAreaProps) {
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
      <textarea
        id={ids.controlId}
        rows={rows}
        aria-describedby={ids.describedBy}
        aria-invalid={ids.invalid || undefined}
        required={required}
        className={cn(
          "w-full resize-y rounded-control border bg-card px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:opacity-50",
          ids.invalid ? "border-destructive" : "border-input"
        )}
        {...props}
      />
    </Field>
  );
}
