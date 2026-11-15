import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app";
import { createAppRouter } from "@/app/router";
import { initializeSession } from "@/auth/session";
import { initializeInstallPrompt } from "@/pwa/use-install-prompt";
import { initializeTheme } from "@/theme";

const container = document.getElementById("root");
if (!container) throw new Error("index.html has no #root element.");

initializeTheme();
// Restores the session with one silent refresh; route loaders wait for the answer.
initializeSession();
// Chrome's install offer can arrive before React starts; keep it for Settings → Install the app.
initializeInstallPrompt();

createRoot(container).render(
  <StrictMode>
    <App router={createAppRouter()} />
  </StrictMode>
);
