// Placeholder: the screen arrives with the chat module.
import { ComingSoonPage, AskIllustration } from "@/components/states";
import { useLang } from "@/lang";

export function AskPage() {
  const lang = useLang();
  return (
    <ComingSoonPage title={lang.nav.ask} illustration={<AskIllustration />} />
  );
}
