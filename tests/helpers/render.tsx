// Renders for tests, with the same providers as the app.
//
//   renderWithProviders(<AppearanceSettings />)         a component
//   renderRoute("/today", { as: "STUDENT" })            the real route tree at a path, signed in
//   renderRoute("/plan")                                 ... or signed out
import { render, type RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Providers } from "@/app/providers";
import { buildRoutes } from "@/app/router";
import { queryClient } from "@/api/query-client";
import type { UserRole } from "@/auth/roles";
import type { SessionUser } from "@/auth/session-store";
import { clearSession, setSession } from "@/auth/session-store";
import { makeUser } from "./mock-server/backend";

export function renderWithProviders(ui: ReactNode): RenderResult {
  return render(<Providers queryClient={queryClient}>{ui}</Providers>);
}

export interface RenderRouteOptions {
  /** Signed in with this role (a test user from makeUser). Signed out when left out. */
  as?: UserRole;
  /** Changes to the test user. */
  user?: Partial<SessionUser>;
}

export function renderRoute(path: string, options: RenderRouteOptions = {}) {
  if (options.as) {
    setSession(
      "test-access-token",
      makeUser({ role: options.as, ...options.user })
    );
  } else {
    clearSession();
  }
  const router = createMemoryRouter(buildRoutes(), { initialEntries: [path] });
  const result = render(
    <Providers queryClient={queryClient}>
      <RouterProvider router={router} />
    </Providers>
  );
  return { ...result, router };
}
