// Log in (with Google only), plus the sign-up, email verification and password reset placeholders.
import { createPageRoute } from "@/routing/page-route";

export const authRoutes = [
  createPageRoute({
    path: "/login",
    access: "guest",
    page: () => import("./pages/login-page").then((file) => file.LoginPage),
    titleKey: "pages.login",
  }),
  createPageRoute({
    path: "/signup",
    access: "guest",
    page: () => import("./pages/signup-page").then((file) => file.SignupPage),
    titleKey: "pages.signup",
  }),
  createPageRoute({
    path: "/verify-email",
    access: "public",
    page: () =>
      import("./pages/verify-email-page").then((file) => file.VerifyEmailPage),
    titleKey: "pages.verifyEmail",
  }),
  createPageRoute({
    path: "/forgot-password",
    access: "guest",
    page: () =>
      import("./pages/forgot-password-page").then(
        (file) => file.ForgotPasswordPage
      ),
    titleKey: "pages.forgotPassword",
  }),
  createPageRoute({
    path: "/reset-password",
    access: "guest",
    page: () =>
      import("./pages/reset-password-page").then(
        (file) => file.ResetPasswordPage
      ),
    titleKey: "pages.resetPassword",
  }),
];
