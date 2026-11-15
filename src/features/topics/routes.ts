// Strong topics and the ones that need practice.
import { LEARNER_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const topicsRoutes = [
  defineRoute({
    path: "/topics",
    access: LEARNER_ROLES,
    page: () => import("./pages/topics-page").then((m) => m.TopicsPage),
    titleKey: "nav.topics",
  }),
];
