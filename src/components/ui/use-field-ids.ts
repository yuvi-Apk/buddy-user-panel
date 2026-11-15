import { type ReactNode, useId } from "react";

export interface FieldIds {
  controlId: string;
  hintId: string | undefined;
  errorId: string | undefined;
  /** For the control's aria-describedby: the hint and the error, when shown. */
  describedBy: string | undefined;
  invalid: boolean;
}

/** Ties a control to its hint and error, so screen readers read them with the field. */
export function useFieldIds(
  id: string | undefined,
  { hint, error }: { hint?: ReactNode; error?: ReactNode }
): FieldIds {
  const generated = useId();
  const controlId = id ?? generated;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return { controlId, hintId, errorId, describedBy, invalid: Boolean(error) };
}
