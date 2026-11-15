// ESLint guardrails. Each ban enforces a rule in .claude/rules/core-rules.md, and its message names
// the rule number. tests/guardrails/eslint-rules.test.ts proves every ban still fires.
import tanstackQuery from "@tanstack/eslint-plugin-query";
import { defineConfig, globalIgnores } from "eslint/config";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import i18next from "eslint-plugin-i18next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { importBoundaries } from "./eslint/import-boundaries.js";

const buddy = { rules: { "import-boundaries": importBoundaries } };

// --- syntax bans (no-restricted-syntax) -------------------------------------

// `import.meta.env.DEV` alone is allowed: it is a build flag, not configuration, and only a literal
// check lets the bundler leave dev-only code (the /dev routes) out of production.
const envBan = {
  selector:
    "MemberExpression[object.type='MetaProperty'][property.name='env']:not(MemberExpression[property.name='DEV'] > MemberExpression.object)",
  message:
    "Read env only through `env` from src/config/env.ts (core-rules #12). Only `import.meta.env.DEV` may be used elsewhere.",
};

const innerHtmlBan = {
  selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
  message:
    "dangerouslySetInnerHTML is banned (core-rules #11). Render text, or markdown without raw HTML.",
};

const defaultExportBan = {
  selector: "ExportDefaultDeclaration",
  message: "Use a named export (core-rules #19).",
};

const rawElementBan = {
  selector: "JSXOpeningElement[name.name=/^(button|input|select|textarea)$/]",
  message:
    "Use the shared components from @/components/ui (Button, TextField, ...) instead of raw form elements (core-rules #4).",
};

// --- global bans (no-restricted-globals / no-restricted-properties) ---------

const FETCH_MESSAGE =
  "Only src/lib/api/ calls fetch (core-rules #9). Use your feature's api/ hook.";
const STORAGE_MESSAGE =
  "Browser storage only through src/lib/storage.ts, and never for tokens or personal data (core-rules #8).";

const fetchGlobal = [{ name: "fetch", message: FETCH_MESSAGE }];
const storageGlobals = ["localStorage", "sessionStorage", "indexedDB"].map(
  (name) => ({ name, message: STORAGE_MESSAGE })
);

const onGlobalObjects = (property, message) =>
  ["window", "globalThis", "self"].map((object) => ({
    object,
    property,
    message,
  }));
const fetchProperties = onGlobalObjects("fetch", FETCH_MESSAGE);
const storageProperties = [
  "localStorage",
  "sessionStorage",
  "indexedDB",
].flatMap((name) => onGlobalObjects(name, STORAGE_MESSAGE));

// --- screen text (core-rules #5) --------------------------------------------

const literalTextBan = [
  "error",
  {
    mode: "jsx-only",
    "jsx-attributes": {
      include: [
        "^alt$",
        "^aria-label$",
        "^aria-description$",
        "^placeholder$",
        "^title$",
        "^label$",
        "^hint$",
        "^description$",
      ],
    },
    message:
      "Screen text lives in src/lang/en.json. Read it with useLang() (core-rules #5).",
  },
];

// --- config -----------------------------------------------------------------

export default defineConfig(
  globalIgnores([
    "dist/**",
    "dev-dist/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "public/**",
    ".claude/**",
  ]),

  // TypeScript, type-checked (the same base as the backend).
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "error",
      "no-eval": "error",
      "no-new-func": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // App code in src/: React rules, accessibility, and the bans that apply everywhere.
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      // Query keys list every value the query uses; no unstable query clients (data-and-api.md).
      tanstackQuery.configs["flat/recommended-strict"],
    ],
    plugins: { buddy },
    rules: {
      "buddy/import-boundaries": "error",
      "no-restricted-syntax": ["error", envBan, innerHtmlBan, defaultExportBan],
      "no-restricted-globals": ["error", ...fetchGlobal, ...storageGlobals],
      "no-restricted-properties": [
        "error",
        ...fetchProperties,
        ...storageProperties,
      ],
    },
  },

  // Tailwind classes must exist in our design system (core-rules #1): Tailwind's own palette is
  // removed in index.css, so `bg-indigo-600` or `text-xs` is reported as unknown, like a typo.
  // Class order is left to the Prettier plugin.
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [betterTailwindcss.configs["correctness-error"]],
    settings: {
      "better-tailwindcss": { entryPoint: "src/styles/index.css" },
    },
    rules: {
      "better-tailwindcss/no-duplicate-classes": "error",
      "better-tailwindcss/no-deprecated-classes": "error",
    },
  },

  // Screen text never sits in JSX (dev tools and tests are exempt).
  {
    files: ["src/**/*.tsx"],
    ignores: ["src/**/*.test.tsx", "src/test/**", "src/features/dev/**"],
    plugins: { i18next },
    rules: { "i18next/no-literal-string": literalTextBan },
  },

  // Features build screens only from the shared components.
  {
    files: ["src/features/**/*.tsx"],
    ignores: ["src/**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        envBan,
        innerHtmlBan,
        defaultExportBan,
        rawElementBan,
      ],
    },
  },

  // --- the few files allowed to do what everyone else may not ---------------

  // The only reader of import.meta.env.
  {
    files: ["src/config/env.ts"],
    rules: {
      "no-restricted-syntax": ["error", innerHtmlBan, defaultExportBan],
    },
  },

  // The only caller of fetch.
  {
    files: ["src/lib/api/**/*.ts"],
    ignores: ["src/**/*.test.ts"],
    rules: {
      "no-restricted-globals": ["error", ...storageGlobals],
      "no-restricted-properties": ["error", ...storageProperties],
    },
  },

  // The only user of browser storage.
  {
    files: ["src/lib/storage.ts"],
    rules: {
      "no-restricted-globals": ["error", ...fetchGlobal],
      "no-restricted-properties": ["error", ...fetchProperties],
    },
  },

  // The only file that may write to the console (development builds only).
  {
    files: ["src/lib/logger.ts"],
    rules: { "no-console": "off" },
  },

  // Tests may touch storage and fetch to check the code that wraps them.
  {
    files: ["src/**/*.test.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": "off",
      "no-restricted-properties": "off",
    },
  },

  // Plain JS files (this config, the local ESLint rule) are not part of the TypeScript project.
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  }
);
