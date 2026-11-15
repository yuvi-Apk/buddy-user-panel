// Log in, sign up, email verification and password reset (email and password only).
import { defineRoute } from "@/lib/routing/define-route";

export const authRoutes = [
  defineRoute({
    path: "/login",
    access: "guest",
    page: () => import("./pages/login-page").then((m) => m.LoginPage),
    titleKey: "pages.login",
  }),
  defineRoute({
    path: "/signup",
    access: "guest",
    page: () => import("./pages/signup-page").then((m) => m.SignupPage),
    titleKey: "pages.signup",
  }),
  defineRoute({
    path: "/verify-email",
    access: "public",
    page: () =>
      import("./pages/verify-email-page").then((m) => m.VerifyEmailPage),
    titleKey: "pages.verifyEmail",
  }),
  defineRoute({
    path: "/forgot-password",
    access: "guest",
    page: () =>
      import("./pages/forgot-password-page").then((m) => m.ForgotPasswordPage),
    titleKey: "pages.forgotPassword",
  }),
  defineRoute({
    path: "/reset-password",
    access: "guest",
    page: () =>
      import("./pages/reset-password-page").then((m) => m.ResetPasswordPage),
    titleKey: "pages.resetPassword",
  }),
];
