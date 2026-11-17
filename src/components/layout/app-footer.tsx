// A quiet footer: the app's name, what it is for, and the year.
//   <AppFooter />                     under login, invite links and 404 (FocusShell)
//   <AppFooter variant="compact" />   at the foot of the laptop sidebar
// Phones' signed-in screens have no footer: the tab bar sits there.
import { fill, useLang } from "@/lang";
import { cn } from "@/utils/cn";

export function AppFooter({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  const lang = useLang();
  const copyright = fill(lang.footer.copyright, {
    year: String(new Date().getFullYear()),
    appName: lang.common.appName,
  });

  if (variant === "compact") {
    return (
      <footer
        data-slot="app-footer"
        className={cn("px-3 text-sm text-muted-foreground", className)}
      >
        {copyright}
      </footer>
    );
  }

  return (
    <footer
      data-slot="app-footer"
      className={cn(
        "flex flex-col items-center gap-1 border-t border-border px-4 py-5 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:px-6 md:text-start lg:px-8",
        className
      )}
    >
      <span>{lang.footer.tagline}</span>
      <span>{copyright}</span>
    </footer>
  );
}
