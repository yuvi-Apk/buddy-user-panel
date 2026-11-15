// Placeholder: the screen arrives with the organization-membership module.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function JoinPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.join} />;
}
