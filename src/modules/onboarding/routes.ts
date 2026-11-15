// First steps after sign-up: exam category and exam date.
import { LEARNER_ROLES } from "@/auth/roles";
import { defineRoute } from "@/routing/define-route";

export const onboardingRoutes = [
  defineRoute({
    path: "/onboarding",
    access: LEARNER_ROLES,
    page: () =>
      import("./pages/onboarding-page").then((file) => file.OnboardingPage),
    titleKey: "pages.onboarding",
    layout: "focus",
  }),
];
