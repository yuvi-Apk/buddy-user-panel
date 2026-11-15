// A window.matchMedia that tests control (jsdom has none). setup.ts installs it.
//
//   setMediaQuery("(prefers-color-scheme: dark)", true);
//
// From then on that query matches, and every list made for it hears a "change" event, as if the
// phone had switched to dark mode. Nothing matches until a test says so; setup.ts resets this
// after each test.

const matching = new Map<string, boolean>();
const lists = new Set<FakeMediaQueryList>();

class FakeMediaQueryList extends EventTarget {
  readonly media: string;
  onchange: ((event: Event) => void) | null = null;

  constructor(media: string) {
    super();
    this.media = media;
  }

  get matches(): boolean {
    return matching.get(this.media) ?? false;
  }

  /** The old API some libraries still use. */
  addListener(listener: (event: Event) => void): void {
    this.addEventListener("change", listener);
  }

  removeListener(listener: (event: Event) => void): void {
    this.removeEventListener("change", listener);
  }
}

export function installMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => {
      const list = new FakeMediaQueryList(query);
      lists.add(list);
      return list;
    },
  });
}

/** Makes a media query match (or stop matching) and tells everyone listening to it. */
export function setMediaQuery(query: string, matches: boolean): void {
  matching.set(query, matches);
  for (const list of lists) {
    if (list.media !== query) continue;
    const event = Object.assign(new Event("change"), { matches, media: query });
    list.onchange?.(event);
    list.dispatchEvent(event);
  }
}

export function resetMediaQueries(): void {
  matching.clear();
  lists.clear();
}
