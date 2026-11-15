// Today's tasks and the day-by-day study plan.
import { LEARNER_ROLES } from "@/auth/roles";
import { createPageRoute } from "@/routing/page-route";

export const studyPlanRoutes = [
  createPageRoute({
    path: "/today",
    access: LEARNER_ROLES,
    page: () => import("./pages/today-page").then((file) => file.TodayPage),
    titleKey: "nav.today",
  }),
  createPageRoute({
    path: "/plan",
    access: LEARNER_ROLES,
    page: () => import("./pages/plan-page").then((file) => file.PlanPage),
    titleKey: "nav.plan",
  }),
];
