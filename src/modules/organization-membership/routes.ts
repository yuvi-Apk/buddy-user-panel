// Joining an Organization: a code creates a pending request; an invite link from an email.
import { createPageRoute } from "@/routing/page-route";

export const organizationMembershipRoutes = [
  createPageRoute({
    path: "/join",
    access: ["INDIVIDUAL"],
    page: () => import("./pages/join-page").then((file) => file.JoinPage),
    titleKey: "nav.join",
  }),
  createPageRoute({
    path: "/invite/:token",
    access: "public",
    page: () => import("./pages/invite-page").then((file) => file.InvitePage),
    titleKey: "pages.invite",
  }),
];
