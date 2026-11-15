// Placeholder: the screen arrives with the chat module.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function AskPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.ask} />;
}
