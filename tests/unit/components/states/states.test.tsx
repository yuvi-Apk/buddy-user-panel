// ErrorState, OfflineBanner, and EmptyState with a picture.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { fill, getLang } from "@/lang";
import {
  ComingSoonPage,
  EmptyState,
  ErrorState,
  OfflineBanner,
  TodayIllustration,
} from "@/components/states";
import { renderWithProviders } from "@tests/helpers/render";

const { common, feedback } = getLang();

describe("ErrorState", () => {
  it("says calmly what happened, offers to try again and shows the reference", async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} reference="req_7f3a" />);

    expect(
      screen.getByRole("heading", { name: feedback.errorTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(feedback.errorBody)).toBeInTheDocument();
    expect(
      screen.getByText(fill(feedback.errorReference, { id: "req_7f3a" }))
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: common.tryAgain })
    );
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows no button when there is nothing to retry", () => {
    render(<ErrorState title="This plan was deleted" />);
    expect(
      screen.getByRole("heading", { name: "This plan was deleted" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("OfflineBanner", () => {
  function setOnline(online: boolean): void {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(online);
    window.dispatchEvent(new Event(online ? "online" : "offline"));
  }

  it("shows a calm notice while offline, and goes away when back online", () => {
    render(<OfflineBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => setOnline(false));
    expect(screen.getByRole("status")).toHaveTextContent(feedback.offline);

    act(() => setOnline(true));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("EmptyState with an illustration", () => {
  it("shows the picture instead of the icon, hidden from screen readers", () => {
    const { container } = renderWithProviders(
      <EmptyState
        icon={<span data-testid="icon" />}
        illustration={<TodayIllustration />}
        title="Nothing planned yet"
      />
    );

    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    const picture = container.querySelector('[data-slot="illustration"]');
    expect(picture).toHaveAttribute("aria-hidden", "true");
    // Its words are not read out: the only heading is the empty state's own.
    expect(screen.getByRole("heading")).toHaveTextContent(
      "Nothing planned yet"
    );
  });

  it("passes through ComingSoonPage", () => {
    const { container } = renderWithProviders(
      <ComingSoonPage title="Today" illustration={<TodayIllustration />} />
    );
    expect(
      container.querySelector('[data-slot="illustration"]')
    ).toBeInTheDocument();
    expect(screen.getByText(feedback.comingSoonTitle)).toBeVisible();
  });
});
