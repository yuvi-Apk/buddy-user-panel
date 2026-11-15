// PostToolUse hook: formats the file Claude just edited with Prettier.
// Reads the hook payload (JSON) from stdin. Never fails the tool call.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const FORMATTABLE = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".html",
  ".md",
  ".yml",
  ".yaml",
]);

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

try {
  const payload = JSON.parse(raw);
  const filePath =
    payload?.tool_response?.filePath ?? payload?.tool_input?.file_path;
  const prettierBin = path.resolve("node_modules/prettier/bin/prettier.cjs");

  const shouldFormat =
    typeof filePath === "string" &&
    existsSync(filePath) &&
    existsSync(prettierBin) &&
    FORMATTABLE.has(path.extname(filePath).toLowerCase()) &&
    !path.basename(filePath).startsWith(".env");

  if (shouldFormat) {
    execFileSync(
      process.execPath,
      [prettierBin, "--write", "--ignore-unknown", filePath],
      { stdio: "ignore" }
    );
  }
} catch {
  // A formatting problem must never block an edit.
}
