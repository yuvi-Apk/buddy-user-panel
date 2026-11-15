// The look of a menu item in the sidebar and the "More" sheet. The selected item is tinted with
// the primary color and marked with aria-current="page" (NavLink sets it), never by color alone:
// it also gets a bar on its edge.
import { cn } from "@/utils/cn";

export function listItemClasses(isActive: boolean): string {
  return cn(
    "relative flex min-h-11 items-center gap-3 rounded-control px-3 font-semibold transition-colors duration-150 [&_svg]:size-6 [&_svg]:shrink-0",
    isActive
      ? "bg-primary-soft text-primary-soft-foreground before:absolute before:inset-y-2 before:start-0 before:w-1 before:rounded-full before:bg-primary"
      : "text-muted-foreground hover:bg-hover hover:text-foreground"
  );
}
