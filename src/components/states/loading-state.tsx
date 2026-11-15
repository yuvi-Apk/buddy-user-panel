// A screen or section that is loading: skeletons shaped like the content, and one "Loading"
// announcement for screen readers.
//   <LoadingState><Skeleton className="h-24" /><Skeleton className="h-24" /></LoadingState>
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";

export function LoadingState({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const lang = useLang();

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("flex flex-col gap-3", className)}
    >
      <span className="sr-only">{lang.common.loading}</span>
      {children ?? (
        <>
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </>
      )}
    </div>
  );
}
