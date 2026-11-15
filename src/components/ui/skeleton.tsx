import { cn } from "@/lib/cn";

/**
 * A grey placeholder shaped like the content that is loading. Hidden from screen readers:
 * wrap skeletons in <LoadingState>, which announces "Loading" once.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-control bg-muted", className)}
    />
  );
}
