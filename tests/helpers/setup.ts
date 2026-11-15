// Runs before every test file in src/ (the "app" project, jsdom).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { queryClient } from "@/api/query-client";
import { resetSession } from "@/auth/session-store";
import { installMatchMedia, resetMediaQueries } from "./media-query";
import { server } from "./mock-server/server";

// The mock backend. A request without a handler fails the test.
beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});
afterAll(() => {
  server.close();
});

// jsdom has no ResizeObserver. Radix measures some parts with it (checkbox, switch, popovers);
// in tests nothing is ever resized, so observing can do nothing.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = ResizeObserverStub;
}

// jsdom has no pointer capture. Radix uses it for swiping (toasts) and dragging.
if (typeof Element.prototype.hasPointerCapture !== "function") {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// jsdom has no matchMedia either. Tests switch media queries with setMediaQuery().
installMatchMedia();

afterEach(() => {
  // Testing Library only cleans up by itself when test globals are on; they are off here.
  cleanup();
  resetMediaQueries();
  window.localStorage.clear();
  server.resetHandlers();
  // Each test starts as the app does: session unknown ("restoring"), nothing cached.
  resetSession();
  queryClient.clear();
});
