// The person's own profile.
import { USER_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const profileRoutes = [
  defineRoute({
    path: "/profile",
    access: USER_ROLES,
    page: () => import("./pages/profile-page").then((m) => m.ProfilePage),
    titleKey: "nav.profile",
  }),
];
