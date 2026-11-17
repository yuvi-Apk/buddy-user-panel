// The avatar button in the top bar. It opens a menu: who is signed in, Profile, Settings, Sign out.
//   <AccountMenu user={user} onSignOut={signOut} />
import { CircleUser, LogOut, Settings } from "lucide-react";
import { Link } from "react-router";
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useLang } from "@/lang";
import type { SessionUser } from "@/auth/session-store";
import { cn } from "@/utils/cn";
import { AccountSummary } from "./account-summary";

export interface AccountMenuProps {
  user: SessionUser;
  onSignOut: () => void;
  className?: string;
}

export function AccountMenu({ user, onSignOut, className }: AccountMenuProps) {
  const lang = useLang();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={lang.nav.accountMenu}
        className={cn(
          "flex size-11 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-150 hover:bg-hover data-[state=open]:bg-hover",
          className
        )}
      >
        <Avatar name={user.name} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <AccountSummary user={user} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <CircleUser aria-hidden />
            {lang.nav.profile}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings aria-hidden />
            {lang.nav.settings}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut aria-hidden />
          {lang.nav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
