// Log in, sign up, email verification and password reset (email and password only).
import { defineRoute } from "@/routing/define-route";

export const authRoutes = [
  defineRoute({
    path: "/login",
    access: "guest",
    page: () => import("./pages/login-page").then((file) => file.LoginPage),
    titleKey: "pages.login",
  }),
  defineRoute({
    path: "/signup",
    access: "guest",
    page: () => import("./pages/signup-page").then((file) => file.SignupPage),
    titleKey: "pages.signup",
  }),
  defineRoute({
    path: "/verify-email",
    access: "public",
    page: () =>
      import("./pages/verify-email-page").then((file) => file.VerifyEmailPage),
    titleKey: "pages.verifyEmail",
  }),
  defineRoute({
    path: "/forgot-password",
    access: "guest",
    page: () =>
      import("./pages/forgot-password-page").then(
        (file) => file.ForgotPasswordPage
      ),
    titleKey: "pages.forgotPassword",
  }),
  defineRoute({
    path: "/reset-password",
    access: "guest",
    page: () =>
      import("./pages/reset-password-page").then(
        (file) => file.ResetPasswordPage
      ),
    titleKey: "pages.resetPassword",
  }),
];
