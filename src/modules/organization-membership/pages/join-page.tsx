// Placeholder: the screen arrives with the organization-membership module.
import { ComingSoonPage, JoinIllustration } from "@/components/states";
import { useLang } from "@/lang";

export function JoinPage() {
  const lang = useLang();
  return (
    <ComingSoonPage title={lang.nav.join} illustration={<JoinIllustration />} />
  );
}
