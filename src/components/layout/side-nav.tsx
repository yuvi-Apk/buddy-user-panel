// The sidebar on laptops (lg and up): every menu item of the role, then who is signed in.
import { LogOut } from "lucide-react";
import { NavLink } from "react-router";
import { Button, Divider } from "@/components/ui";
import type { NavItem, RoleNavigation } from "@/config/navigation";
import { textAt, useLang } from "@/lang";
import type { SessionUser } from "@/auth/session-store";
import { cn } from "@/utils/cn";
import { AccountSummary } from "./account-summary";
import { BrandMark } from "./brand-mark";
import { getNavItemClasses } from "./nav-styles";

export interface SideNavProps {
  navigation: RoleNavigation;
  user: SessionUser;
  onSignOut: () => void;
  className?: string;
}

export function SideNav({
  navigation,
  user,
  onSignOut,
  className,
}: SideNavProps) {
  const lang = useLang();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-30 hidden w-64 flex-col gap-4 border-e border-border bg-card px-3 py-5 lg:flex",
        className
      )}
    >
      <BrandMark className="px-3" />
      <nav
        aria-label={lang.nav.main}
        className="flex flex-1 flex-col gap-1 overflow-y-auto"
      >
        <NavList items={navigation.tabs} />
        {navigation.more.length > 0 ? (
          <>
            <Divider className="my-2" />
            <NavList items={navigation.more} />
          </>
        ) : null}
      </nav>
      <div className="flex flex-col gap-2 border-t border-border px-1 pt-4">
        <AccountSummary user={user} className="px-2" />
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={onSignOut}
        >
          <LogOut aria-hidden />
          {lang.nav.signOut}
        </Button>
      </div>
    </aside>
  );
}

/** A list of menu links. The current page gets aria-current="page" and the selected look. */
export function NavList({
  items,
  onNavigate,
}: {
  items: readonly NavItem[];
  onNavigate?: () => void;
}) {
  const lang = useLang();
  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ path, labelKey, icon: Icon }) => (
        <li key={path}>
          <NavLink
            to={path}
            onClick={onNavigate}
            className={({ isActive }) => getNavItemClasses(isActive)}
          >
            <Icon aria-hidden />
            {textAt(lang, labelKey)}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
