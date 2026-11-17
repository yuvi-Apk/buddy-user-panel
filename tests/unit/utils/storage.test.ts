import { describe, expect, it, vi } from "vitest";
import {
  readFromStorage,
  removeFromStorage,
  STORAGE_KEYS,
  writeToStorage,
} from "@/utils/storage";

describe("storage", () => {
  it("allows only these keys", () => {
    // Adding a key? It must never hold a token, an email, a name, an answer or any study data:
    // phones and school computers are shared.
    expect(STORAGE_KEYS).toEqual({
      theme: "buddy.theme",
      language: "buddy.language",
      signedOut: "buddy.signed-out",
      googleSignIn: "buddy.google-sign-in",
    });
  });

  it("rejects any other key at compile time", () => {
    const neverRun = () => {
      // @ts-expect-error: only the keys above can be stored
      writeToStorage("accessToken", "secret");
    };
    expect(neverRun).toBeTypeOf("function");
  });

  it("saves, reads and removes a value under its buddy.* name", () => {
    writeToStorage("theme", "saved");
    expect(window.localStorage.getItem("buddy.theme")).toBe("saved");
    expect(readFromStorage("theme")).toBe("saved");

    removeFromStorage("theme");
    expect(readFromStorage("theme")).toBeNull();
  });

  it("keeps working when storage is blocked (private browsing)", () => {
    const blocked = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(blocked);

    expect(readFromStorage("theme")).toBeNull();
    expect(() => writeToStorage("theme", "saved")).not.toThrow();
    expect(() => removeFromStorage("theme")).not.toThrow();
  });
});
