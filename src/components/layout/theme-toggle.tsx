// The light / dark switch in the top-right corner: one tap flips what is on screen.
//   <ThemeToggle />
// "System" mode and the four themes stay in Settings → Appearance.
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui";
import { useLang } from "@/lang";
import { useTheme } from "@/theme";
import { cn } from "@/utils/cn";

const iconClasses =
  "absolute inset-0 m-auto transition-[opacity,rotate,scale] duration-250 ease-out motion-reduce:transition-none";

export function ThemeToggle({ className }: { className?: string }) {
  const lang = useLang();
  const { resolvedMode, setMode } = useTheme();
  const isDark = resolvedMode === "dark";

  return (
    <IconButton
      className={className}
      label={isDark ? lang.theme.switchToLight : lang.theme.switchToDark}
      onClick={() => {
        setMode(isDark ? "light" : "dark");
      }}
      icon={
        // Both icons stay mounted in one slot and crossfade, so the change moves instead of popping.
        <span aria-hidden className="relative size-5">
          <Sun
            className={cn(
              iconClasses,
              isDark ? "scale-50 -rotate-90 opacity-0" : "opacity-100"
            )}
          />
          <Moon
            className={cn(
              iconClasses,
              isDark ? "opacity-100" : "scale-50 rotate-90 opacity-0"
            )}
          />
        </span>
      }
    />
  );
}
