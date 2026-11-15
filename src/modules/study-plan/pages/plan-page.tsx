// Placeholder: the screen arrives with the study-plan module.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function PlanPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.nav.plan} />;
}
