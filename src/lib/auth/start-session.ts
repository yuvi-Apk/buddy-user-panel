// Runs once when the app starts (main.tsx):
//   1. one silent refresh restores the session from the refresh cookie (route loaders wait for it)
//   2. other tabs' sign-ins and sign-outs are followed
//   3. a sign-out that happened offline is finished once the device is back online
import { logger } from "@/lib/logger";
import { refreshSession } from "./refresh";
import {
  endSession,
  hasPendingSignOut,
  retryPendingSignOut,
} from "./session-actions";
import { clearSession, getSession } from "./session-store";
import { listenForSessionEvents } from "./session-sync";

/** Returns a function that stops the listeners (for tests). */
export function startSession(): () => void {
  void restoreSession();

  const stopListening = listenForSessionEvents((type) => {
    if (type === "signed-out") {
      endSession({ announce: false });
      return;
    }
    if (getSession().status === "signed-in") return;
    refreshSession()
      .then((ok) => {
        if (!ok) clearSession();
      })
      .catch(() => {
        clearSession();
      });
  });

  const onOnline = () => {
    void retryPendingSignOut();
  };
  window.addEventListener("online", onOnline);

  return () => {
    stopListening();
    window.removeEventListener("online", onOnline);
  };
}

/** Signed in with the refresh cookie, or signed out. Never leaves the app "restoring". */
export async function restoreSession(): Promise<void> {
  if (hasPendingSignOut()) {
    // The person signed out while offline: never bring the session back on its own.
    clearSession();
    await retryPendingSignOut();
    return;
  }
  try {
    const ok = await refreshSession();
    if (!ok) clearSession();
  } catch {
    // Offline or the server is down: show the login screen; it explains what's wrong.
    logger.info("The session could not be restored");
    clearSession();
  }
}
