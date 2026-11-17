// Log in with Google (the first sign-in creates the account) and Google's way back into the app.
import { createPageRoute } from "@/routing/page-route";
import { GOOGLE_CALLBACK_PATH } from "./google-sign-in";

export const authRoutes = [
  createPageRoute({
    path: "/login",
    access: "guest",
    page: () => import("./pages/login-page").then((file) => file.LoginPage),
    titleKey: "pages.login",
  }),
  createPageRoute({
    path: GOOGLE_CALLBACK_PATH,
    access: "guest",
    page: () =>
      import("./pages/google-callback-page").then(
        (file) => file.GoogleCallbackPage
      ),
    titleKey: "pages.signingIn",
  }),
];
