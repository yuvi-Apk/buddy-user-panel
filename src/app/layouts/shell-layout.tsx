// The two frames routes render in (createPageRoute picks one with `layout`).
import { Outlet, useNavigate } from "react-router";
import { AppShell, FocusShell } from "@/components/layout";
import { LOGIN_PATH } from "@/config/navigation";
import { signOut } from "@/auth/session";
import { useSession } from "@/auth/session-store";

/** Signed-in screens: top bar and tabs on phones, sidebar on laptops. */
export function ShellLayout() {
  const user = useSession((session) => session.user);
  const navigate = useNavigate();

  // The route loader has already sent signed-out people to /login; this covers the moment between.
  if (!user) return null;

  return (
    <AppShell
      user={user}
      onSignOut={() => {
        // signOut() forgets the session at once, so the login page opens signed out.
        void signOut();
        void navigate(LOGIN_PATH, { replace: true });
      }}
    >
      <Outlet />
    </AppShell>
  );
}

/** Everything else: login, sign-up, invite links, dev tools, 404. */
export function FocusLayout() {
  return (
    <FocusShell>
      <Outlet />
    </FocusShell>
  );
}
