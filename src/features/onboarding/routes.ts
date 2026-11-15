// First steps after sign-up: exam category and exam date.
import { LEARNER_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const onboardingRoutes = [
  defineRoute({
    path: "/onboarding",
    access: LEARNER_ROLES,
    page: () => import("./pages/onboarding-page").then((m) => m.OnboardingPage),
    titleKey: "pages.onboarding",
    layout: "focus",
  }),
];
