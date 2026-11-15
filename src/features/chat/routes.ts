// Ask doubts and practise with Buddy.
import { LEARNER_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const chatRoutes = [
  defineRoute({
    path: "/ask",
    access: LEARNER_ROLES,
    page: () => import("./pages/ask-page").then((m) => m.AskPage),
    titleKey: "nav.ask",
  }),
];
