// ESLint config. Besides the usual React and TypeScript rules it holds the project bans (fetch,
// storage, env, raw form elements, typed-in text, imports across modules). Each message says what
// to do instead. tests/project-rules/eslint-rules.test.ts proves every ban still fires.
import tanstackQuery from "@tanstack/eslint-plugin-query";
import { defineConfig, globalIgnores } from "eslint/config";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import i18next from "eslint-plugin-i18next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// --- syntax bans (no-restricted-syntax) -------------------------------------

// `import.meta.env.DEV` alone is allowed: it is a build flag, not configuration, and only a literal
// check lets the bundler leave dev-only code (the /dev routes) out of production.
const envBan = {
  selector:
    "MemberExpression[object.type='MetaProperty'][property.name='env']:not(MemberExpression[property.name='DEV'] > MemberExpression.object)",
  message:
    "Read env only through `env` from src/config/env.ts. Only `import.meta.env.DEV` may be used elsewhere.",
};

const innerHtmlBan = {
  selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
  message:
    "dangerouslySetInnerHTML is banned. Render text, or markdown without raw HTML.",
};

const defaultExportBan = {
  selector: "ExportDefaultDeclaration",
  message: "Use a named export.",
};

const rawElementBan = {
  selector: "JSXOpeningElement[name.name=/^(button|input|select|textarea)$/]",
  message:
    "Use the shared components from @/components/ui (Button, Input, ...) instead of raw form elements.",
};

// --- global bans (no-restricted-globals / no-restricted-properties) ---------

const FETCH_MESSAGE =
  "Only src/api/ calls fetch. Use the api/ hook of your module.";
const STORAGE_MESSAGE =
  "Browser storage only through src/utils/storage.ts, and never for tokens or personal data.";

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

// --- screen text --------------------------------------------

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
    message: "Screen text lives in src/lang/en.json. Read it with useLang().",
  },
];

// --- imports between folders (no-restricted-imports) --------------------------
//
//   src/app            may import everything
//   src/modules/<x>    its own files with relative paths ("../components/x"), another module only
//                      through its index ("@/modules/auth"), never src/app
//   everything else    is shared code: never imports a module or src/app

const TESTS_IMPORT = {
  group: ["@tests/*", "@tests/**"],
  message: "App code never imports test helpers.",
};
const MODULE_FILES_IMPORT = {
  group: ["@/modules/*/**"],
  message:
    'Import another module only through its index ("@/modules/auth"). Inside a module, use relative paths.',
};
const APP_IMPORT = {
  group: ["@/app", "@/app/**"],
  message: "Only src/main.tsx and src/app may import src/app.",
};
const ANY_MODULE_IMPORT = {
  group: ["@/modules", "@/modules/**"],
  message:
    "Shared code never imports a module. Move the shared part into components/, hooks/ or utils/.",
};
const restrictImports = (...patterns) => ["error", { patterns }];

// --- config -----------------------------------------------------------------

export default defineConfig(
  globalIgnores([
    "dist/**",
    "dev-dist/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "public/**",
    // Third-party skill installed with `npx skills`: its examples are reference code, not app code.
    ".claude/skills/stageshow/**",
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
      // Query keys list every value the query uses; no unstable query clients .
      tanstackQuery.configs["flat/recommended-strict"],
    ],
    rules: {
      "no-restricted-imports": restrictImports(
        TESTS_IMPORT,
        APP_IMPORT,
        ANY_MODULE_IMPORT
      ),
      "no-restricted-syntax": ["error", envBan, innerHtmlBan, defaultExportBan],
      "no-restricted-globals": ["error", ...fetchGlobal, ...storageGlobals],
      "no-restricted-properties": [
        "error",
        ...fetchProperties,
        ...storageProperties,
      ],
    },
  },

  // Tailwind classes must exist in our design system: Tailwind's own palette is
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
    ignores: ["src/modules/dev/**"],
    plugins: { i18next },
    rules: { "i18next/no-literal-string": literalTextBan },
  },

  // Modules build screens only from the shared components, and stay out of each other's files.
  {
    files: ["src/modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictImports(
        TESTS_IMPORT,
        APP_IMPORT,
        MODULE_FILES_IMPORT
      ),
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
    files: ["src/api/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", ...storageGlobals],
      "no-restricted-properties": ["error", ...storageProperties],
    },
  },

  // The only user of browser storage.
  {
    files: ["src/utils/storage.ts"],
    rules: {
      "no-restricted-globals": ["error", ...fetchGlobal],
      "no-restricted-properties": ["error", ...fetchProperties],
    },
  },

  // The only file that may write to the console (development builds only).
  {
    files: ["src/utils/logger.ts"],
    rules: { "no-console": "off" },
  },

  // src/app and main.tsx put the modules together.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/main.tsx"],
    rules: {
      "no-restricted-imports": restrictImports(
        TESTS_IMPORT,
        MODULE_FILES_IMPORT
      ),
    },
  },

  // Plain JS files (this config, config scripts) are not part of the TypeScript project.
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  }
);
