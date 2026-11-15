// core-rules #16: "Organization" is written in full in code, file names and text.
// Also: every file and folder name in src/ and tests/ is kebab-case.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCANNED = ["src", "tests", "eslint"];
const SCANNED_FILES = [
  "index.html",
  "vite.config.ts",
  "vitest.config.ts",
  "eslint.config.js",
];
const THIS_FILE = path.join("tests", "guardrails", "naming.test.ts");

// Shortened forms of "Organization". Domains (w3.org), npm scopes (@org) and URL paths are fine.
const SHORTENED = [
  /(?<![A-Za-z0-9.@/])orgs?(?![a-z])/, // org, orgs, orgId, org_id, org-admin
  /(?<![A-Za-z0-9.@/])Orgs?(?![a-z])/, // Org, OrgAdmin
  /(?<=[a-z0-9])Orgs?(?![a-z])/, //       userOrgId, myOrgs
  /(?<![A-Za-z0-9])ORGS?(?![A-Z])/, //    ORG, ORG_ID
];

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)*$/;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? [full, ...walk(full)] : [full];
  });
}

const paths = SCANNED.flatMap(walk);
const files = [
  ...paths.filter((p) => path.extname(p) !== ""),
  ...SCANNED_FILES,
].filter((p) => p !== THIS_FILE);

describe("Organization is never shortened", () => {
  it("in code and text", () => {
    const hits: string[] = [];
    for (const file of files) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (SHORTENED.some((pattern) => pattern.test(line))) {
            hits.push(`${file}:${index + 1}: ${line.trim()}`);
          }
        });
    }
    expect(hits, 'Write "Organization" (organizationId, ...) in full').toEqual(
      []
    );
  });

  it("in file and folder names", () => {
    const hits = paths.filter((p) =>
      SHORTENED.some((pattern) => pattern.test(path.basename(p)))
    );
    expect(hits).toEqual([]);
  });
});

describe("file and folder names", () => {
  it("are kebab-case in src/ and tests/", () => {
    const wrong = paths
      .filter((p) => !p.startsWith("eslint"))
      .filter((p) => !KEBAB_CASE.test(path.basename(p)));
    expect(wrong, "Use kebab-case, e.g. study-plan-card.tsx").toEqual([]);
  });
});
