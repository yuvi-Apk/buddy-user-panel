// The top bar on phones and tablets (under lg). Laptops have the sidebar instead.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BrandMark } from "./brand-mark";

export function TopBar({
  actions,
  className,
}: {
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-card px-4 pt-[env(safe-area-inset-top)] lg:hidden",
        className
      )}
    >
      <BrandMark />
      {actions ? (
        <div className="flex items-center gap-1">{actions}</div>
      ) : null}
    </header>
  );
}
