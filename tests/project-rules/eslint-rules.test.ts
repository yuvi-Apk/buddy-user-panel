// Proves the ESLint bans in eslint.config.js really block what the project forbids, and still
// allow the few files that are meant to do those things.
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";

// Fixture code is linted from memory (the files do not exist), so type-aware rules are switched
// off here. The bans under test do not need type information.
const eslint = new ESLint({
  overrideConfig: [tseslint.configs.disableTypeChecked],
});

async function ruleIdsFor(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).map(
    (message) => message.ruleId ?? `parse-error: ${message.message}`
  );
}

const MODULE_PAGE = "src/modules/demo/pages/demo-page.tsx";

describe("modules use the shared components", () => {
  const code =
    'export function DemoPage({ label }: { label: string }) {\n  return <button type="button">{label}</button>;\n}\n';

  it("blocks a raw <button> in a module", async () => {
    expect(await ruleIdsFor(MODULE_PAGE, code)).toContain(
      "no-restricted-syntax"
    );
  });

  it("allows it inside src/components", async () => {
    expect(
      await ruleIdsFor("src/components/ui/button.tsx", code)
    ).not.toContain("no-restricted-syntax");
  });
});

describe("screen text lives in src/lang", () => {
  it("blocks text typed into JSX and into text attributes", async () => {
    const text =
      "export function DemoPage() {\n  return <p>Hello there</p>;\n}\n";
    expect(await ruleIdsFor(MODULE_PAGE, text)).toContain(
      "i18next/no-literal-string"
    );

    const alt =
      'export function DemoPage({ src }: { src: string }) {\n  return <img alt="A happy student" src={src} />;\n}\n';
    expect(await ruleIdsFor(MODULE_PAGE, alt)).toContain(
      "i18next/no-literal-string"
    );
  });

  it("allows text read from lang, and class names", async () => {
    const code =
      'declare const lang: { title: string };\nexport function DemoPage() {\n  return <p className="text-lg">{lang.title}</p>;\n}\n';
    expect(await ruleIdsFor(MODULE_PAGE, code)).not.toContain(
      "i18next/no-literal-string"
    );
  });

  it("does not apply to the dev-only pages", async () => {
    const code =
      "export function GalleryPage() {\n  return <p>Buttons</p>;\n}\n";
    expect(
      await ruleIdsFor("src/modules/dev/pages/ui-gallery-page.tsx", code)
    ).not.toContain("i18next/no-literal-string");
  });
});

describe("browser storage only through src/utils/storage.ts", () => {
  const code =
    'export const a = localStorage.getItem("x");\nexport const b = window.sessionStorage.length;\n';

  it("blocks storage elsewhere", async () => {
    const ids = await ruleIdsFor("src/components/ui/demo.ts", code);
    expect(ids).toContain("no-restricted-globals");
    expect(ids).toContain("no-restricted-properties");
  });

  it("allows it in src/utils/storage.ts", async () => {
    const ids = await ruleIdsFor("src/utils/storage.ts", code);
    expect(ids).not.toContain("no-restricted-globals");
    expect(ids).not.toContain("no-restricted-properties");
  });
});

describe("only src/api calls fetch", () => {
  const code =
    'export const a = fetch("/api/v1/health");\nexport const b = window.fetch("/api/v1/health");\n';

  it("blocks fetch in a module", async () => {
    const ids = await ruleIdsFor("src/modules/demo/api/demo.queries.ts", code);
    expect(ids).toContain("no-restricted-globals");
    expect(ids).toContain("no-restricted-properties");
  });

  it("allows it in src/api", async () => {
    const ids = await ruleIdsFor("src/api/api-client.ts", code);
    expect(ids).not.toContain("no-restricted-globals");
    expect(ids).not.toContain("no-restricted-properties");
  });
});

describe("imports between folders", () => {
  const importing = (path: string) =>
    `import { x } from "${path}";
export const y = x;
`;
  const RULE = "no-restricted-imports";

  it("blocks reaching into another module's files", async () => {
    expect(
      await ruleIdsFor(
        MODULE_PAGE,
        importing("@/modules/auth/pages/login-page")
      )
    ).toContain(RULE);
  });

  it("allows another module through its index, and the module's own files", async () => {
    for (const path of ["@/modules/auth", "../components/demo-card"]) {
      expect(
        await ruleIdsFor(MODULE_PAGE, importing(path)),
        path
      ).not.toContain(RULE);
    }
  });

  it("blocks shared code from importing a module or app/", async () => {
    for (const [file, path] of [
      ["src/components/ui/demo.tsx", "@/modules/auth"],
      ["src/api/api-client.ts", "@/app/router"],
    ] as const) {
      expect(
        await ruleIdsFor(file, importing(path)),
        `${file} → ${path}`
      ).toContain(RULE);
    }
  });

  it("lets app/ use modules only through their index", async () => {
    expect(
      await ruleIdsFor("src/app/router.ts", importing("@/modules/auth/routes"))
    ).toContain(RULE);
    expect(
      await ruleIdsFor("src/app/router.ts", importing("@/modules/auth"))
    ).not.toContain(RULE);
  });

  it("blocks app code from importing test helpers", async () => {
    expect(
      await ruleIdsFor(MODULE_PAGE, importing("@tests/helpers/render"))
    ).toContain(RULE);
  });
});

describe("no raw HTML or code from strings", () => {
  it("blocks dangerouslySetInnerHTML, eval and new Function", async () => {
    const html =
      "export function Demo({ html }: { html: string }) {\n  return <div dangerouslySetInnerHTML={{ __html: html }} />;\n}\n";
    expect(await ruleIdsFor("src/components/demo.tsx", html)).toContain(
      "no-restricted-syntax"
    );

    const code =
      'export const a = eval("1 + 1");\nexport const b = new Function("return 1");\n';
    const ids = await ruleIdsFor("src/utils/demo.ts", code);
    expect(ids).toContain("no-eval");
    expect(ids).toContain("no-new-func");
  });
});

describe("env only through src/config/env.ts", () => {
  const code = "export const url = import.meta.env.VITE_API_BASE_URL;\n";

  it("blocks import.meta.env elsewhere", async () => {
    expect(
      await ruleIdsFor("src/modules/demo/api/demo.queries.ts", code)
    ).toContain("no-restricted-syntax");
  });

  it("allows it in src/config/env.ts", async () => {
    expect(await ruleIdsFor("src/config/env.ts", code)).not.toContain(
      "no-restricted-syntax"
    );
  });

  it("allows only the DEV build flag elsewhere, so dev-only code is left out of production", async () => {
    const devFlag = "export const routes = import.meta.env.DEV ? [1] : [];\n";
    expect(await ruleIdsFor("src/app/router.ts", devFlag)).not.toContain(
      "no-restricted-syntax"
    );

    const whole = "export const all = import.meta.env;\n";
    const mode = "export const mode = import.meta.env.MODE;\n";
    expect(await ruleIdsFor("src/app/router.ts", whole)).toContain(
      "no-restricted-syntax"
    );
    expect(await ruleIdsFor("src/app/router.ts", mode)).toContain(
      "no-restricted-syntax"
    );
  });
});

describe("code hygiene", () => {
  it("blocks console.log and default exports in src", async () => {
    const ids = await ruleIdsFor(
      "src/utils/demo.ts",
      'console.log("x");\nexport default function demo() {\n  return 1;\n}\n'
    );
    expect(ids).toContain("no-console");
    expect(ids).toContain("no-restricted-syntax");
  });

  it("allows console in src/utils/logger.ts", async () => {
    expect(
      await ruleIdsFor(
        "src/utils/logger.ts",
        'export const log = () => console.info("x");\n'
      )
    ).not.toContain("no-console");
  });
});
