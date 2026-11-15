import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InstallAppSettings } from "@/modules/settings";
import { getLang } from "@/lang";
import { setMediaQuery } from "@tests/helpers/media-query";
import { renderWithProviders } from "@tests/helpers/render";
import { UpdatePrompt } from "@/pwa/update-prompt";
import {
  getInstallStatus,
  startInstallPromptCapture,
} from "@/pwa/use-install-prompt";

const lang = getLang();

// The service worker's register hook, as the PWA plugin provides it.
const sw = vi.hoisted(() => ({
  needRefresh: false,
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(() => Promise.resolve()),
}));
vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({
    needRefresh: [sw.needRefresh, sw.setNeedRefresh],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}));

describe("UpdatePrompt", () => {
  it("shows nothing while there is no new version", () => {
    sw.needRefresh = false;
    renderWithProviders(<UpdatePrompt />);
    expect(screen.queryByText(lang.pwa.updateTitle)).not.toBeInTheDocument();
  });

  it("asks before reloading into a new version", async () => {
    sw.needRefresh = true;
    const user = userEvent.setup();
    renderWithProviders(<UpdatePrompt />);

    expect(screen.getByText(lang.pwa.updateTitle)).toBeVisible();
    expect(sw.updateServiceWorker).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: lang.pwa.reload }));
    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button", { name: lang.pwa.later }));
    expect(sw.setNeedRefresh).toHaveBeenCalledWith(false);
  });
});

describe("installing the app", () => {
  let stop: () => void;
  beforeEach(() => {
    stop = startInstallPromptCapture();
  });
  afterEach(() => {
    stop();
  });

  function offerInstall(outcome: "accepted" | "dismissed" = "accepted") {
    const event = Object.assign(
      new Event("beforeinstallprompt", { cancelable: true }),
      {
        prompt: vi.fn(() => Promise.resolve()),
        userChoice: Promise.resolve({ outcome }),
      }
    );
    act(() => {
      window.dispatchEvent(event);
    });
    return event;
  }

  it("shows nothing where the browser can't install", () => {
    renderWithProviders(<InstallAppSettings />);
    expect(getInstallStatus()).toBe("unavailable");
    expect(screen.queryByText(lang.pwa.installTitle)).not.toBeInTheDocument();
  });

  it("offers our own install button when the browser can install", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InstallAppSettings />);
    const event = offerInstall();
    expect(event.defaultPrevented).toBe(true);

    await user.click(
      screen.getByRole("button", { name: lang.pwa.installButton })
    );
    expect(event.prompt).toHaveBeenCalledOnce();
    // The browser's offer can be used once; the button goes away.
    expect(
      screen.queryByRole("button", { name: lang.pwa.installButton })
    ).not.toBeInTheDocument();
  });

  it("explains Add to Home Screen on iPhone", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15"
    );
    renderWithProviders(<InstallAppSettings />);
    expect(screen.getByText(lang.pwa.iosHint)).toBeVisible();
  });

  it("says so when it already runs as an installed app", () => {
    setMediaQuery("(display-mode: standalone)", true);
    renderWithProviders(<InstallAppSettings />);
    expect(screen.getByText(lang.pwa.installed)).toBeVisible();
  });
});
