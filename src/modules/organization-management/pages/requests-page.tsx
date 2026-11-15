// Placeholder: the screen arrives with the organization-management module.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function RequestsPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.requests} />;
}
