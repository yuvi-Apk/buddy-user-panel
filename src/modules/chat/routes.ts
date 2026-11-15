// Ask doubts and practise with Buddy.
import { LEARNER_ROLES } from "@/auth/roles";
import { createPageRoute } from "@/routing/page-route";

export const chatRoutes = [
  createPageRoute({
    path: "/ask",
    access: LEARNER_ROLES,
    page: () => import("./pages/ask-page").then((file) => file.AskPage),
    titleKey: "nav.ask",
  }),
];
