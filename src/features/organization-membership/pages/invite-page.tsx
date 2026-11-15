// Placeholder: the screen arrives with the organization-membership feature.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function InvitePage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.pages.invite} />;
}
