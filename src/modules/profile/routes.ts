// The person's own profile.
import { USER_ROLES } from "@/auth/roles";
import { defineRoute } from "@/routing/define-route";

export const profileRoutes = [
  defineRoute({
    path: "/profile",
    access: USER_ROLES,
    page: () => import("./pages/profile-page").then((file) => file.ProfilePage),
    titleKey: "nav.profile",
  }),
];
