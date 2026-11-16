// StudyPreview: the login picture shows its last frame when it can't play, and plays its beats
// once when it comes into view.
import { act, screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/helpers/render";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLang } from "@/lang";
import { StudyPreview } from "@/modules/auth/components/study-preview";

const { preview } = getLang().auth;

/** The row (or card) a text sits in, read through its nearest list item. */
function rowOf(text: string): HTMLElement {
  const row = screen.getByText(text).closest("li");
  if (!row) throw new Error(`No row for ${text}`);
  return row;
}

describe("StudyPreview", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows its last frame when the browser can't tell it is in view", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    renderWithProviders(<StudyPreview />);

    expect(rowOf(preview.nextTopic)).toHaveTextContent(preview.done);
    expect(rowOf(preview.nextTopic).className).not.toContain("bg-primary-soft");
    expect(screen.getByRole("progressbar", { hidden: true })).toHaveAttribute(
      "aria-valuenow",
      "60"
    );
  });

  it("is hidden from screen readers", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = renderWithProviders(<StudyPreview />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("plays its beats once it comes into view", () => {
    vi.useFakeTimers();
    let reportInView: (() => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          reportInView = () => {
            callback(
              [{ isIntersecting: true } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver
            );
          };
        }
        observe() {}
        disconnect() {}
      }
    );
    renderWithProviders(<StudyPreview />);

    // At rest: Photosynthesis is up next and highlighted; Fractions is not in the plan yet.
    expect(rowOf(preview.nextTopic).className).toContain("bg-primary-soft");
    const practiceRow = screen
      .getAllByText(preview.practiceTopic)
      .map((element) => element.closest("li"))
      .find((row) => row?.className.includes("grid"));
    expect(practiceRow?.className).toContain("grid-rows-[0fr]");

    act(() => {
      reportInView?.();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(rowOf(preview.nextTopic).className).not.toContain("bg-primary-soft");

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(practiceRow?.className).toContain("grid-rows-[1fr]");
  });
});
