// Runs before the first paint (a plain script in index.html's <head>), so the page never flashes
// the wrong theme. It applies the choice saved by src/theme/theme-store.ts.
// Keep the key and the lists in step with src/utils/storage.ts and src/theme/themes.ts:
// tests/project-rules/theme-boot.test.ts checks them.
(function () {
  var MODES = ["light", "dark", "system"];
  var ACCENTS = ["indigo-ink", "lagoon", "orchid", "graphite"];
  var mode = "system";
  var accent = "indigo-ink";

  try {
    var saved = JSON.parse(
      window.localStorage.getItem("buddy.theme") || "null"
    );
    if (saved && MODES.indexOf(saved.mode) !== -1) mode = saved.mode;
    if (saved && ACCENTS.indexOf(saved.accent) !== -1) accent = saved.accent;
  } catch (error) {
    // Storage blocked or broken: keep the defaults.
  }

  if (mode === "system") {
    var prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    mode = prefersDark ? "dark" : "light";
  }

  document.documentElement.setAttribute("data-mode", mode);
  document.documentElement.setAttribute("data-accent", accent);
})();
