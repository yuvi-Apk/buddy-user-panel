// The person's own profile.
import { USER_ROLES } from "@/auth/roles";
import { createPageRoute } from "@/routing/page-route";

export const profileRoutes = [
  createPageRoute({
    path: "/profile",
    access: USER_ROLES,
    page: () => import("./pages/profile-page").then((file) => file.ProfilePage),
    titleKey: "nav.profile",
  }),
];
