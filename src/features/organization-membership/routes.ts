// Joining an Organization: a code creates a pending request; an invite link from an email.
import { defineRoute } from "@/lib/routing/define-route";

export const organizationMembershipRoutes = [
  defineRoute({
    path: "/join",
    access: ["INDIVIDUAL"],
    page: () => import("./pages/join-page").then((m) => m.JoinPage),
    titleKey: "nav.join",
  }),
  defineRoute({
    path: "/invite/:token",
    access: "public",
    page: () => import("./pages/invite-page").then((m) => m.InvitePage),
    titleKey: "pages.invite",
  }),
];
