// Placeholder: the screen arrives with the topics feature.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function TopicsPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.topics} />;
}
