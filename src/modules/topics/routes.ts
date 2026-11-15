// Strong topics and the ones that need practice.
import { LEARNER_ROLES } from "@/auth/roles";
import { defineRoute } from "@/routing/define-route";

export const topicsRoutes = [
  defineRoute({
    path: "/topics",
    access: LEARNER_ROLES,
    page: () => import("./pages/topics-page").then((file) => file.TopicsPage),
    titleKey: "nav.topics",
  }),
];
