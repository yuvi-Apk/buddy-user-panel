import { describe, expect, it, vi } from "vitest";
import { readStored, removeStored, STORAGE_KEYS, writeStored } from "./storage";

describe("storage", () => {
  it("allows only these keys", () => {
    // Adding a key? It must never hold a token, an email, a name, an answer or any study data:
    // phones and school computers are shared (core-rules #8).
    expect(STORAGE_KEYS).toEqual({
      theme: "buddy.theme",
      language: "buddy.language",
      signedOut: "buddy.signed-out",
    });
  });

  it("rejects any other key at compile time", () => {
    const neverRun = () => {
      // @ts-expect-error: only the keys above can be stored
      writeStored("accessToken", "secret");
    };
    expect(neverRun).toBeTypeOf("function");
  });

  it("saves, reads and removes a value under its buddy.* name", () => {
    writeStored("theme", "saved");
    expect(window.localStorage.getItem("buddy.theme")).toBe("saved");
    expect(readStored("theme")).toBe("saved");

    removeStored("theme");
    expect(readStored("theme")).toBeNull();
  });

  it("keeps working when storage is blocked (private browsing)", () => {
    const blocked = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(blocked);

    expect(readStored("theme")).toBeNull();
    expect(() => writeStored("theme", "saved")).not.toThrow();
    expect(() => removeStored("theme")).not.toThrow();
  });
});
