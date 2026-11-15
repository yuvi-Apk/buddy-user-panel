// The tab bar on phones and tablets (under lg): the role's main tabs, then "More" when the role
// has more items. "More" opens a bottom sheet with the rest, who is signed in, and Sign out.
import { Ellipsis, LogOut } from "lucide-react";
import { type ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
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

function getTabClasses(isActive: boolean): string {
  return cn(
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-control px-1 text-sm font-semibold transition-colors duration-150",
    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
  );
}

/** The icon of a tab. The selected tab also gets a tinted pill, so it is not shown by color alone. */
function TabIcon({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-150 [&_svg]:size-6",
        active && "bg-primary-soft text-primary-soft-foreground"
      )}
    >
      {children}
    </span>
  );
}

export function BottomNav({
  navigation,
  user,
  onSignOut,
  className,
}: BottomNavProps) {
  const lang = useLang();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = navigation.more.some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );

  return (
    <nav
      aria-label={lang.nav.main}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden",
        className
      )}
    >
      <ul className="mx-auto flex max-w-content items-stretch gap-1 px-2 py-1">
        {navigation.tabs.map(({ path, labelKey, icon: Icon }) => (
          <li key={path} className="flex flex-1">
            <NavLink
              to={path}
              className={({ isActive }) => getTabClasses(isActive)}
            >
              {({ isActive }) => (
                <>
                  <TabIcon active={isActive}>
                    <Icon />
                  </TabIcon>
                  {textAt(lang, labelKey)}
                </>
              )}
            </NavLink>
          </li>
        ))}
        {navigation.more.length > 0 ? (
          <li className="flex flex-1">
            <ResponsiveDialog open={moreOpen} onOpenChange={setMoreOpen}>
              <ResponsiveDialogTrigger className={getTabClasses(moreActive)}>
                <TabIcon active={moreActive}>
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
