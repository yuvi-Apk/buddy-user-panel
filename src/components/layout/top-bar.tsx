// The header of every signed-in screen, on every size:
//   phones and tablets (under lg)   the app's name on the left
//   laptops (lg and up)             sits next to the sidebar, which already shows the name
// On the right: the light / dark switch and the avatar menu (Profile, Settings, Sign out).
import type { SessionUser } from "@/auth/session-store";
import { cn } from "@/utils/cn";
import { AccountMenu } from "./account-menu";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

export interface TopBarProps {
  user: SessionUser;
  onSignOut: () => void;
  className?: string;
}

export function TopBar({ user, onSignOut, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-card/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md md:px-6 lg:min-h-16 lg:px-8",
        className
      )}
    >
      <BrandMark className="lg:hidden" />
      <div className="ms-auto flex items-center gap-1">
        <ThemeToggle />
        <AccountMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
