// Placeholder: the screen arrives with the onboarding feature.
import { ComingSoonPage } from "@/components/feedback/coming-soon";
import { useLang } from "@/lang";

export function OnboardingPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.pages.onboarding} />;
}
