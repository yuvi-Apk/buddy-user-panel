// ESLint rule "buddy/import-boundaries" (core-rules #10).
//
// Resolves every import (relative or "@/...") to a path under src/ and checks who may import it:
//   - src/app/**            only from src/main.tsx, src/app/** and src/test/**
//   - src/features/<x>/**   from inside <x>: anything. From app/, main.tsx and other features: only
//                           the feature's index (import "@/features/<x>"). From shared code
//                           (components, lib, hooks, theme, lang, config, pwa): never.
//   - src/test/**           only from tests
// Packages ("react", "zod", ...) are not checked.
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

/** "features/auth/pages/login-page" style path inside src/, with forward slashes, or null. */
function insideSrc(absolutePath) {
  const relative = path.relative(SRC, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return relative.split(path.sep).join("/");
}

/** Which area of src/ a path belongs to: { area: "features", feature: "auth", rest: "pages/x" }. */
function areaOf(srcPath) {
  const [first = "", second = "", ...rest] = srcPath.split("/");
  const area = first.replace(/\.(ts|tsx)$/, "");
  if (area === "features")
    return { area, feature: second, rest: rest.join("/") };
  return { area, feature: null, rest: "" };
}

const isIndex = (rest) => rest === "" || /^index(\.tsx?)?$/.test(rest);
const isTestFile = (srcPath) =>
  /\.test\.tsx?$/.test(srcPath) || srcPath.startsWith("test/");

export const importBoundaries = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Keeps features, app/ and shared code in their lanes (core-rules #10).",
    },
    schema: [],
    messages: {
      appFromOutside:
        "Only src/main.tsx and src/app/ may import app/ (core-rules #10). Move what you need into a shared folder.",
      featureFromShared:
        "Shared code never imports a feature (core-rules #10). Move the shared part into components/, lib/ or hooks/.",
      deepFeatureImport:
        'Import another feature only through its index.ts: "@/features/{{feature}}" (core-rules #10).',
      testFromApp: "App code never imports from src/test/ (core-rules #10).",
    },
  },

  create(context) {
    const importer = insideSrc(path.resolve(context.filename));
    if (importer === null || isTestFile(importer)) return {};
    const from = areaOf(importer);

    function check(sourceNode) {
      const specifier = sourceNode?.value;
      if (typeof specifier !== "string") return;

      let target;
      if (specifier.startsWith("@/"))
        target = path.join(SRC, specifier.slice(2));
      else if (specifier.startsWith("."))
        target = path.resolve(
          path.dirname(path.resolve(context.filename)),
          specifier
        );
      else return; // a package

      const targetPath = insideSrc(target);
      if (targetPath === null) return;
      const to = areaOf(targetPath);

      if (to.area === "test") {
        context.report({ node: sourceNode, messageId: "testFromApp" });
        return;
      }

      if (to.area === "app") {
        if (from.area !== "app" && from.area !== "main") {
          context.report({ node: sourceNode, messageId: "appFromOutside" });
        }
        return;
      }

      if (to.area !== "features") return;
      if (from.area === "features" && from.feature === to.feature) return; // own feature

      const canUseIndex =
        from.area === "app" || from.area === "main" || from.area === "features";
      if (!canUseIndex) {
        context.report({ node: sourceNode, messageId: "featureFromShared" });
      } else if (!isIndex(to.rest)) {
        context.report({
          node: sourceNode,
          messageId: "deepFeatureImport",
          data: { feature: to.feature },
        });
      }
    }

    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
    };
  },
};
