// Today's tasks and the day-by-day study plan.
import { LEARNER_ROLES } from "@/auth/roles";
import { defineRoute } from "@/routing/define-route";

export const studyPlanRoutes = [
  defineRoute({
    path: "/today",
    access: LEARNER_ROLES,
    page: () => import("./pages/today-page").then((file) => file.TodayPage),
    titleKey: "nav.today",
  }),
  defineRoute({
    path: "/plan",
    access: LEARNER_ROLES,
    page: () => import("./pages/plan-page").then((file) => file.PlanPage),
    titleKey: "nav.plan",
  }),
];
