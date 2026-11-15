// Placeholder: the screen arrives with the study-plan module.
import { ComingSoonPage } from "@/components/states";
import { useLang } from "@/lang";

export function TodayPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.today} />;
}
