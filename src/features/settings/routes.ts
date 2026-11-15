// The person's settings. Every signed-in role may open them.
import { USER_ROLES } from "@/lib/auth/roles";
import { defineRoute } from "@/lib/routing/define-route";

export const settingsRoutes = [
  defineRoute({
    path: "/settings",
    access: USER_ROLES,
    page: () => import("./pages/settings-page").then((m) => m.SettingsPage),
    titleKey: "nav.settings",
  }),
];
