// Installing Buddy on the home screen.
//
//   const install = useInstallPrompt();
//   install.status === "available"   → <Button onClick={install.showInstallDialog}>…</Button>
//   install.status === "ios"         → show the "Share, then Add to Home Screen" hint
//   install.status === "installed"   → already running as an installed app
//   install.status === "unavailable" → this browser can't install (show nothing)
//
// Chrome and Edge fire `beforeinstallprompt` once, often before React has started, so
// initializeInstallPrompt() (in main.tsx) keeps it until a screen asks.
import { useSyncExternalStore } from "react";

/** Chrome's install event. Not in TypeScript's DOM types because only Chromium has it. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallStatus = "available" | "ios" | "installed" | "unavailable";

let savedInstallEvent: BeforeInstallPromptEvent | null = null;
let wasJustInstalled = false;
const listeners = new Set<() => void>();

function notifyInstallListeners(): void {
  for (const listener of listeners) listener();
}

/** Starts listening for the install events. Returns a function that stops (for tests). */
export function initializeInstallPrompt(): () => void {
  const onBeforeInstall = (event: Event) => {
    event.preventDefault(); // We show our own button instead of the browser's mini-bar.
    savedInstallEvent = event as BeforeInstallPromptEvent;
    notifyInstallListeners();
  };
  const onInstalled = () => {
    savedInstallEvent = null;
    wasJustInstalled = true;
    notifyInstallListeners();
  };
  window.addEventListener("beforeinstallprompt", onBeforeInstall);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    window.removeEventListener("appinstalled", onInstalled);
    savedInstallEvent = null;
    wasJustInstalled = false;
  };
}

function isRunningAsInstalledApp(): boolean {
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    iosStandalone || window.matchMedia("(display-mode: standalone)").matches
  );
}

/** iPhone, iPod, and iPads (which say "Macintosh" but have a touch screen). */
function isAppleMobile(): boolean {
  const agent = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(agent) ||
    (/Macintosh/i.test(agent) && navigator.maxTouchPoints > 1)
  );
}

export function getInstallStatus(): InstallStatus {
  if (wasJustInstalled || isRunningAsInstalledApp()) return "installed";
  if (savedInstallEvent) return "available";
  if (isAppleMobile()) return "ios";
  return "unavailable";
}

function subscribeToInstallStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Opens the browser's install dialog. True when the person accepted. */
export async function showInstallDialog(): Promise<boolean> {
  const event = savedInstallEvent;
  if (!event) return false;
  savedInstallEvent = null; // The event can be used only once.
  notifyInstallListeners();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}

export function useInstallPrompt(): {
  status: InstallStatus;
  showInstallDialog: () => Promise<boolean>;
} {
  const status = useSyncExternalStore(
    subscribeToInstallStatus,
    getInstallStatus,
    () => "unavailable" as const
  );
  return { status, showInstallDialog };
}
