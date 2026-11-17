// The look of a menu item in the sidebar and the "More" sheet. The selected item is tinted with
// the primary color and marked with aria-current="page" (NavLink sets it), never by color alone:
// it also gets a bar on its edge. The bar is always there and grows in, so nothing pops.
import { cn } from "@/utils/cn";

export function getNavItemClasses(isActive: boolean): string {
  return cn(
    "relative flex min-h-11 items-center gap-3 rounded-control px-3 font-semibold transition-colors duration-200 [&_svg]:size-6 [&_svg]:shrink-0",
    "before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-full before:bg-primary before:transition-[scale,opacity] before:duration-200 motion-reduce:before:transition-none",
    isActive
      ? "bg-primary-soft text-primary-soft-foreground before:scale-y-100 before:opacity-100"
      : "text-muted-foreground before:scale-y-0 before:opacity-0 hover:bg-hover hover:text-foreground"
  );
}
