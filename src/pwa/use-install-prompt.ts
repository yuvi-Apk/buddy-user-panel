// Installing Buddy on the home screen.
//
//   const install = useInstallPrompt();
//   install.status === "available"   → <Button onClick={install.promptInstall}>…</Button>
//   install.status === "ios"         → show the "Share, then Add to Home Screen" hint
//   install.status === "installed"   → already running as an installed app
//   install.status === "unavailable" → this browser can't install (show nothing)
//
// Chrome and Edge fire `beforeinstallprompt` once, often before React has started, so
// startInstallPromptCapture() (in main.tsx) keeps it until a screen asks.
import { useSyncExternalStore } from "react";

/** Chrome's install event. Not in TypeScript's DOM types because only Chromium has it. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallStatus = "available" | "ios" | "installed" | "unavailable";

let deferred: BeforeInstallPromptEvent | null = null;
let installedNow = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Starts listening for the install events. Returns a function that stops (for tests). */
export function startInstallPromptCapture(): () => void {
  const onBeforeInstall = (event: Event) => {
    event.preventDefault(); // We show our own button instead of the browser's mini-bar.
    deferred = event as BeforeInstallPromptEvent;
    emit();
  };
  const onInstalled = () => {
    deferred = null;
    installedNow = true;
    emit();
  };
  window.addEventListener("beforeinstallprompt", onBeforeInstall);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    window.removeEventListener("appinstalled", onInstalled);
    deferred = null;
    installedNow = false;
  };
}

function isStandalone(): boolean {
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
  if (installedNow || isStandalone()) return "installed";
  if (deferred) return "available";
  if (isAppleMobile()) return "ios";
  return "unavailable";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Opens the browser's install dialog. True when the person accepted. */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  deferred = null; // The event can be used only once.
  emit();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}

export function useInstallPrompt(): {
  status: InstallStatus;
  promptInstall: () => Promise<boolean>;
} {
  const status = useSyncExternalStore(
    subscribe,
    getInstallStatus,
    () => "unavailable" as const
  );
  return { status, promptInstall };
}
