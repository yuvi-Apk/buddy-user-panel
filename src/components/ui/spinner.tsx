import { LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";

/** A turning circle, for inside buttons. Hidden from screen readers: the button says it is busy. */
export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      aria-hidden
      className={cn("size-5 shrink-0 animate-spin", className)}
    />
  );
}
