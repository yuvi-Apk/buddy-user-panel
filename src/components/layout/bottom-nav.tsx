// The tab bar on phones and tablets (under lg): the role's main tabs, then "More" when the role
// has more items. "More" opens a bottom sheet with the rest, who is signed in, and Sign out.
// The selected tab's pill is one shared part that slides to the tab, instead of popping.
import { Ellipsis, LogOut } from "lucide-react";
import { type ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  Button,
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui";
import type { RoleNavigation } from "@/config/navigation";
import { textAt, useLang } from "@/lang";
import type { SessionUser } from "@/auth/session-store";
import { cn } from "@/utils/cn";
import { AccountSummary } from "./account-summary";
import { NavList } from "./side-nav";

export interface BottomNavProps {
  navigation: RoleNavigation;
  user: SessionUser;
  onSignOut: () => void;
  className?: string;
}

// The icon sits 6px from the tab's top, so the sliding pill (top-2.5 = 4px bar padding + 6px)
// lines up with it.
function getTabClasses(isActive: boolean): string {
  return cn(
    "relative flex min-h-14 flex-1 flex-col items-center justify-start gap-0.5 rounded-control px-1 pt-1.5 text-sm font-semibold transition-colors duration-200",
    isActive
      ? "text-primary-soft-foreground"
      : "text-muted-foreground hover:text-foreground"
  );
}

function TabIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="flex h-7 w-12 items-center justify-center [&_svg]:size-6"
    >
      {children}
    </span>
  );
}

const isPathActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export function BottomNav({
  navigation,
  user,
  onSignOut,
  className,
}: BottomNavProps) {
  const lang = useLang();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = navigation.more.some((item) =>
    isPathActive(pathname, item.path)
  );
  const hasMore = navigation.more.length > 0;
  const slotCount = navigation.tabs.length + (hasMore ? 1 : 0);
  const tabIndex = navigation.tabs.findIndex((item) =>
    isPathActive(pathname, item.path)
  );
  const activeIndex =
    tabIndex >= 0 ? tabIndex : moreActive ? slotCount - 1 : -1;

  return (
    <nav
      aria-label={lang.nav.main}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden",
        className
      )}
    >
      <ul className="relative mx-auto flex max-w-content items-stretch px-2 py-1">
        {/* The selected tab's pill: one part that slides between the tabs. Besides the color,
            it marks the tab by shape; the link also has aria-current="page". */}
        <li
          aria-hidden
          className={cn(
            "pointer-events-none absolute start-2 top-2.5 flex justify-center transition-[translate,opacity] duration-250 ease-out motion-reduce:transition-none",
            activeIndex < 0 && "opacity-0"
          )}
          style={{
            width: `calc((100% - 1rem) / ${String(slotCount)})`,
            translate: `${String(Math.max(activeIndex, 0) * 100)}% 0`,
          }}
        >
          <span className="h-7 w-12 rounded-full bg-primary-soft" />
        </li>
        {navigation.tabs.map(({ path, labelKey, icon: Icon }) => (
          <li key={path} className="flex flex-1">
            <NavLink
              to={path}
              className={({ isActive }) => getTabClasses(isActive)}
            >
              <TabIcon>
                <Icon />
              </TabIcon>
              {textAt(lang, labelKey)}
            </NavLink>
          </li>
        ))}
        {hasMore ? (
          <li className="flex flex-1">
            <ResponsiveDialog open={moreOpen} onOpenChange={setMoreOpen}>
              <ResponsiveDialogTrigger className={getTabClasses(moreActive)}>
                <TabIcon>
                  <Ellipsis />
                </TabIcon>
                {lang.nav.more}
              </ResponsiveDialogTrigger>
              <ResponsiveDialogContent title={lang.nav.more}>
                <div className="flex flex-col gap-4 pb-2">
                  <AccountSummary user={user} />
                  <NavList
                    items={navigation.more}
                    onNavigate={() => {
                      setMoreOpen(false);
                    }}
                  />
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setMoreOpen(false);
                      onSignOut();
                    }}
                  >
                    <LogOut aria-hidden />
                    {lang.nav.signOut}
                  </Button>
                </div>
              </ResponsiveDialogContent>
            </ResponsiveDialog>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
