// Who is signed in: picture or initials, name, and role. Shown in the sidebar and the "More" sheet.
import { getOwnImageUrl } from "@/api/http-request";
import { Avatar } from "@/components/ui";
import { ROLE_LABEL_KEYS } from "@/config/navigation";
import { textAt, useLang } from "@/lang";
import type { SessionUser } from "@/auth/session-store";
import { cn } from "@/utils/cn";

export function AccountSummary({
  user,
  className,
}: {
  user: SessionUser;
  className?: string;
}) {
  const lang = useLang();
  const role = textAt(lang, ROLE_LABEL_KEYS[user.role]);
  const organizationName = user.organization?.name;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar name={user.name} src={getOwnImageUrl(user.avatarUrl)} size="sm" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-sm text-muted-foreground">
          {organizationName ? `${role} · ${organizationName}` : role}
        </span>
      </div>
    </div>
  );
}
