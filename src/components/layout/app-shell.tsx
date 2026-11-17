// The frame around every signed-in screen:
//   phones and tablets (under lg)   top bar + content + bottom tab bar
//   laptops (lg and up)             sidebar + top bar + content
// The top bar always has the light / dark switch and the avatar menu. Plus the skip link and the
// offline banner. The menus come from src/config/navigation.ts.
//
// FocusShell is the calm frame for everything else (login, invite links, 404): the name of the
// app, the light / dark switch, the content and a small footer, nothing to wander off to.
import type { ReactNode } from "react";
import { OfflineBanner } from "@/components/states";
import { NAVIGATION_BY_ROLE } from "@/config/navigation";
import type { SessionUser } from "@/auth/session-store";
import { AppFooter } from "./app-footer";
import { BottomNav } from "./bottom-nav";
import { BrandMark } from "./brand-mark";
import { SideNav } from "./side-nav";
import { MAIN_CONTENT_ID, SkipLink } from "./skip-link";
import { ThemeToggle } from "./theme-toggle";
import { TopBar } from "./top-bar";

export interface AppShellProps {
  user: SessionUser;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppShell({ user, onSignOut, children }: AppShellProps) {
  const navigation = NAVIGATION_BY_ROLE[user.role];

  return (
    <div className="min-h-dvh bg-background">
      <SkipLink />
      <SideNav navigation={navigation} user={user} onSignOut={onSignOut} />
      <div className="flex min-h-dvh flex-col lg:ps-64">
        <TopBar user={user} onSignOut={onSignOut} />
        <OfflineBanner className="sticky top-14 z-20 lg:top-16" />
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] outline-none lg:pb-0"
        >
          {children}
        </main>
      </div>
      <BottomNav navigation={navigation} user={user} onSignOut={onSignOut} />
    </div>
  );
}

export function FocusShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SkipLink />
      <header className="flex min-h-14 items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)] md:px-6 lg:px-8">
        <BrandMark />
        <ThemeToggle />
      </header>
      <OfflineBanner />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <AppFooter className="pb-[calc(1.25rem+env(safe-area-inset-bottom))]" />
    </div>
  );
}
