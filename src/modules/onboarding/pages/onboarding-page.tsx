// The first screen after someone signs in for the first time: studying on their own, or with
// their school or coaching. "With my school or coaching" goes to /join, which only sends a
// request: the person stays INDIVIDUAL until the Organization accepts (core-rules #11).
// The exam category step comes here once the backend can save it.
import { Building, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Page, PageHeader } from "@/components/layout";
import { Button, ChoiceCardGroup } from "@/components/ui";
import { getHomePathForRole } from "@/config/navigation";
import { useLang } from "@/lang";

type StudyChoice = "on-my-own" | "with-organization";

const JOIN_PATH = "/join";

export function OnboardingPage() {
  const lang = useLang();
  const navigate = useNavigate();
  const [choice, setChoice] = useState<StudyChoice>("on-my-own");

  const options = [
    {
      value: "on-my-own",
      title: lang.onboarding.onMyOwnTitle,
      description: lang.onboarding.onMyOwnBody,
      media: <UserRound className="size-6 text-primary" />,
    },
    {
      value: "with-organization",
      title: lang.onboarding.withOrganizationTitle,
      description: lang.onboarding.withOrganizationBody,
      media: <Building className="size-6 text-primary" />,
    },
  ];

  return (
    <Page width="reading">
      <div className="flex flex-col gap-8 py-4 lg:py-12">
        <PageHeader
          title={lang.onboarding.title}
          description={lang.onboarding.intro}
        />
        <ChoiceCardGroup
          label={lang.onboarding.choiceLabel}
          options={options}
          columns={1}
          value={choice}
          onValueChange={(value) => {
            setChoice(value === "with-organization" ? value : "on-my-own");
          }}
        />
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Mail aria-hidden className="mt-0.5 size-4 shrink-0" />
          {lang.onboarding.inviteHint}
        </p>
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            void navigate(
              choice === "with-organization"
                ? JOIN_PATH
                : getHomePathForRole("INDIVIDUAL"),
              { replace: true }
            );
          }}
        >
          {lang.onboarding.continue}
        </Button>
      </div>
    </Page>
  );
}
