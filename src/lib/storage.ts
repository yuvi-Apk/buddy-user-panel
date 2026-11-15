// The only door to browser storage (core-rules #8).
//
// Only the keys below can be stored, and none of them may ever hold a token, an email, a name,
// an answer or any study data: phones and school computers are often shared. Every call is safe
// when storage is blocked or full (private browsing): reads give null, writes are skipped.
const KEYS = {
  /** { mode, accent } chosen in Settings → Appearance. Also read by public/theme-boot.js. */
  theme: "buddy.theme",
  /** The language code chosen in Settings. */
  language: "buddy.language",
  /**
   * "1" after signing out while offline: the next launch must not restore the session, and the
   * server sign-out is retried once back online (src/lib/auth/session-actions.ts). Only a flag.
   */
  signedOut: "buddy.signed-out",
} as const;

export type StorageKey = keyof typeof KEYS;

export const STORAGE_KEYS: Readonly<Record<StorageKey, string>> = KEYS;

export function readStored(key: StorageKey): string | null {
  try {
    return window.localStorage.getItem(KEYS[key]);
  } catch {
    return null;
  }
}

export function writeStored(key: StorageKey, value: string): void {
  try {
    window.localStorage.setItem(KEYS[key], value);
  } catch {
    // Storage is blocked or full: the setting just won't be remembered.
  }
}

export function removeStored(key: StorageKey): void {
  try {
    window.localStorage.removeItem(KEYS[key]);
  } catch {
    // Nothing to remove when storage is blocked.
  }
}
