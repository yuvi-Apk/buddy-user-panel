import { describe, expect, it } from "vitest";
import { env, parseEnv } from "@/config/env";

describe("env", () => {
  it("uses /api/v1 when the variable is missing, so a plain build works", () => {
    expect(env.apiBaseUrl).toBe("/api/v1");
    expect(parseEnv({}).VITE_API_BASE_URL).toBe("/api/v1");
  });

  it("removes a trailing slash", () => {
    expect(
      parseEnv({ VITE_API_BASE_URL: "https://api.example.com/api/v1/" })
        .VITE_API_BASE_URL
    ).toBe("https://api.example.com/api/v1");
  });

  it("refuses an empty value and names the variable", () => {
    expect(() => parseEnv({ VITE_API_BASE_URL: "" })).toThrow(
      /VITE_API_BASE_URL/
    );
  });
});
