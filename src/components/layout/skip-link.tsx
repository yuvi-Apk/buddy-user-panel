// The first thing a keyboard reaches on every page: jumps past the menus to the page content.
// Hidden until it has focus.
import { useLang } from "@/lang";

export const MAIN_CONTENT_ID = "main";

export function SkipLink() {
  const lang = useLang();
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only rounded-control bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
    >
      {lang.nav.skipToContent}
    </a>
  );
}
