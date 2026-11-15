import { describe, expect, it } from "vitest";
import { env, parseAppEnv } from "./env";

describe("env", () => {
  it("reads the test values", () => {
    expect(env.apiBaseUrl).toBe("/api/v1");
  });

  it.each([
    ["/api/v1/", "/api/v1"],
    ["https://api.example.com/api/v1", "https://api.example.com/api/v1"],
    ["http://localhost:4000/api/v1", "http://localhost:4000/api/v1"],
  ])("accepts %s", (value, expected) => {
    expect(parseAppEnv({ VITE_API_BASE_URL: value }).VITE_API_BASE_URL).toBe(
      expected
    );
  });

  it.each(["http://api.example.com", "//api.example.com", "secret-host:9999"])(
    "refuses %s, naming the variable but never its value",
    (value) => {
      expect(() => parseAppEnv({ VITE_API_BASE_URL: value })).toThrow(
        /VITE_API_BASE_URL/
      );
      try {
        parseAppEnv({ VITE_API_BASE_URL: value });
      } catch (error) {
        expect(String(error)).not.toContain(value);
      }
    }
  );

  it("uses /api/v1 when the variable is missing, so a plain build works", () => {
    expect(parseAppEnv({}).VITE_API_BASE_URL).toBe("/api/v1");
  });

  it("refuses an empty value", () => {
    expect(() => parseAppEnv({ VITE_API_BASE_URL: "" })).toThrow(
      /VITE_API_BASE_URL/
    );
  });
});
