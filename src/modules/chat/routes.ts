// Ask doubts and practise with Buddy.
import { LEARNER_ROLES } from "@/auth/roles";
import { defineRoute } from "@/routing/define-route";

export const chatRoutes = [
  defineRoute({
    path: "/ask",
    access: LEARNER_ROLES,
    page: () => import("./pages/ask-page").then((file) => file.AskPage),
    titleKey: "nav.ask",
  }),
];
