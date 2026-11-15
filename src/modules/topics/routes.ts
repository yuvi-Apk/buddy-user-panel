// Strong topics and the ones that need practice.
import { LEARNER_ROLES } from "@/auth/roles";
import { createPageRoute } from "@/routing/page-route";

export const topicsRoutes = [
  createPageRoute({
    path: "/topics",
    access: LEARNER_ROLES,
    page: () => import("./pages/topics-page").then((file) => file.TopicsPage),
    titleKey: "nav.topics",
  }),
];
