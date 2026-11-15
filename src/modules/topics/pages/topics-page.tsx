// Placeholder: the screen arrives with the topics module.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function TopicsPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.topics} />;
}
