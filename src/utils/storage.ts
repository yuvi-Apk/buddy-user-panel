// The only door to browser storage.
//
// Only the keys below can be stored, and none of them may ever hold a token, an email, a name,
// an answer or any study data: phones and school computers are often shared. Every call is safe
// when storage is blocked or full (private browsing): reads give null, writes are skipped.
// Keys in TAB_ONLY_KEYS live in sessionStorage (this tab, until it closes); the rest in localStorage.
const KEYS = {
  /** { mode, accent } chosen in Settings → Appearance. Also read by public/theme-boot.js. */
  theme: "buddy.theme",
  /** The language code chosen in Settings. */
  language: "buddy.language",
  /**
   * "1" after signing out while offline: the next launch must not restore the session, and the
   * server sign-out is retried once back online (src/auth/session.ts). Only a flag.
   */
  signedOut: "buddy.signed-out",
  /**
   * { state, nonce, redirect } while the person is away at Google (src/modules/auth/google-sign-in.ts):
   * two random values and a path in this app. Tab only, and removed when they come back.
   */
  googleSignIn: "buddy.google-sign-in",
} as const;

export type StorageKey = keyof typeof KEYS;

export const STORAGE_KEYS: Readonly<Record<StorageKey, string>> = KEYS;

const TAB_ONLY_KEYS: ReadonlySet<StorageKey> = new Set(["googleSignIn"]);

function storageFor(key: StorageKey): Storage {
  return TAB_ONLY_KEYS.has(key) ? window.sessionStorage : window.localStorage;
}

export function readFromStorage(key: StorageKey): string | null {
  try {
    return storageFor(key).getItem(KEYS[key]);
  } catch {
    return null;
  }
}

export function writeToStorage(key: StorageKey, value: string): void {
  try {
    storageFor(key).setItem(KEYS[key], value);
  } catch {
    // Storage is blocked or full: the setting just won't be remembered.
  }
}

export function removeFromStorage(key: StorageKey): void {
  try {
    storageFor(key).removeItem(KEYS[key]);
  } catch {
    // Nothing to remove when storage is blocked.
  }
}
