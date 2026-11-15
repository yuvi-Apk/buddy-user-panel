// PreToolUse hook for shell commands: blocks any command that touches a real env file.
//
// The deny rules in settings.json stop the Read and Edit tools on .env, but not a shell
// command such as `cat .env` or `Get-Content .env`. This hook closes that gap.
// Allowed: .env.sample (committed, no secrets), and `import.meta.env` in code.
// Exit code 2 tells Claude Code to refuse the command and show the message to Claude.

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let command = "";
try {
  command = String(JSON.parse(raw)?.tool_input?.command ?? "");
} catch {
  process.exit(0); // Not a payload we understand: let the normal permission rules decide.
}

// ".env" at the start of a path segment (not "import.meta.env"), and what follows it.
const ENV_REFERENCE = /(?<![\w$])\.env([\w.*-]*)/g;
const ALLOWED_SUFFIXES = new Set([".sample"]);

for (const match of command.matchAll(ENV_REFERENCE)) {
  const suffix = match[1] ?? "";
  if (!ALLOWED_SUFFIXES.has(suffix)) {
    process.stderr.write(
      `Blocked: this command touches "${match[0]}". Real env files belong to the user ` +
        "and must not be read or changed. Use .env.sample instead, and ask the user to " +
        "update .env themselves (see .claude/rules/core-rules.md #9).\n"
    );
    process.exit(2);
  }
}

process.exit(0);
