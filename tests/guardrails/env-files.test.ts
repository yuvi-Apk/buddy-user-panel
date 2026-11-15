// core-rules #12: .env.sample and .env.test list exactly the variables the schemas read
// (src/config/env-schema.ts for the browser, tooling/dev-server-env.ts for the dev server), the test
// values pass the schemas, and no browser variable looks like a secret.
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { describe, expect, it } from "vitest";
import { appEnvSchema, parseAppEnv } from "@/config/env-schema";
import {
  devServerEnvSchema,
  parseDevServerEnv,
} from "../../tooling/dev-server-env";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

function read(file: string): Record<string, string> {
  return parseEnv(readFileSync(path.join(ROOT, file), "utf8")) as Record<
    string,
    string
  >;
}

const schemaKeys = [
  ...Object.keys(appEnvSchema.shape),
  ...Object.keys(devServerEnvSchema.shape),
].sort();

describe.each([".env.sample", ".env.test"])("%s", (file) => {
  const values = read(file);

  it("lists exactly the variables the schemas read", () => {
    expect(Object.keys(values).sort()).toEqual(schemaKeys);
  });

  it("has values that pass the schemas", () => {
    expect(() => parseAppEnv(values)).not.toThrow();
    expect(() => parseDevServerEnv(values)).not.toThrow();
  });
});

describe("browser variables", () => {
  it("only VITE_* variables are in the browser schema", () => {
    expect(
      Object.keys(appEnvSchema.shape).filter((key) => !key.startsWith("VITE_"))
    ).toEqual([]);
  });

  it("no dev-server variable is a VITE_* one (it would reach the browser)", () => {
    expect(
      Object.keys(devServerEnvSchema.shape).filter((key) =>
        key.startsWith("VITE_")
      )
    ).toEqual([]);
  });

  it("no VITE_* name looks like a secret (everything in it is public)", () => {
    const suspicious = Object.keys(appEnvSchema.shape).filter((key) =>
      /SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY|CREDENTIAL/i.test(key)
    );
    expect(suspicious).toEqual([]);
  });
});
