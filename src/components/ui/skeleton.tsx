import { cn } from "@/utils/cn";

/**
 * A grey placeholder shaped like the content that is loading. Hidden from screen readers:
 * wrap skeletons in <LoadingState>, which announces "Loading" once.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-control bg-muted", className)}
    />
  );
}
