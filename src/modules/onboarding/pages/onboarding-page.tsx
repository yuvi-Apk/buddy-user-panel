// Placeholder: the screen arrives with the onboarding module.
import { ComingSoonPage } from "@/components/states";
import { useLang } from "@/lang";

export function OnboardingPage() {
  const lang = useLang();
  return <ComingSoonPage title={lang.pages.onboarding} />;
}
