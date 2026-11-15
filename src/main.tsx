import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app";
import { createAppRouter } from "@/app/router";
import { startSession } from "@/auth/session";
import { startInstallPromptCapture } from "@/pwa/use-install-prompt";
import { startThemeSync } from "@/theme";

const container = document.getElementById("root");
if (!container) throw new Error("index.html has no #root element.");

startThemeSync();
// Restores the session with one silent refresh; route loaders wait for the answer.
startSession();
// Chrome's install offer can arrive before React starts; keep it for Settings → Install the app.
startInstallPromptCapture();

createRoot(container).render(
  <StrictMode>
    <App router={createAppRouter()} />
  </StrictMode>
);
