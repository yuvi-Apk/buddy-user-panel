// Today's tasks and the day-by-day study plan.
import { LEARNER_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const studyPlanRoutes = [
  defineRoute({
    path: "/today",
    access: LEARNER_ROLES,
    page: () => import("./pages/today-page").then((m) => m.TodayPage),
    titleKey: "nav.today",
  }),
  defineRoute({
    path: "/plan",
    access: LEARNER_ROLES,
    page: () => import("./pages/plan-page").then((m) => m.PlanPage),
    titleKey: "nav.plan",
  }),
];
