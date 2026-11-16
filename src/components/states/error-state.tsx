// What a screen shows when its data could not load. Says it calmly, offers to try again, and
// shows the request's reference so support can find it in the logs.
import { RotateCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { fill, useLang } from "@/lang";
import { EmptyState } from "./empty-state";

export interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  /** The request id from the API error, when there is one. */
  reference?: string;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  reference,
  className,
}: ErrorStateProps) {
  const lang = useLang();

  return (
    <EmptyState
      variant="destructive"
      icon={<TriangleAlert />}
      title={title ?? lang.feedback.errorTitle}
      description={description ?? lang.feedback.errorBody}
      className={className}
      action={
        <div className="flex flex-col items-center gap-3">
          {onRetry ? (
            <Button onClick={onRetry}>
              <RotateCw aria-hidden />
              {lang.common.tryAgain}
            </Button>
          ) : null}
          {reference ? (
            <p className="text-sm text-muted-foreground">
              {fill(lang.feedback.errorReference, { id: reference })}
            </p>
          ) : null}
        </div>
      }
    />
  );
}
