import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app";
import { createAppRouter } from "@/app/router";
import { startSession } from "@/lib/auth/start-session";
import { startThemeSync } from "@/theme";

const container = document.getElementById("root");
if (!container) throw new Error("index.html has no #root element.");

startThemeSync();
// Restores the session with one silent refresh; route loaders wait for the answer.
startSession();

createRoot(container).render(
  <StrictMode>
    <App router={createAppRouter()} />
  </StrictMode>
);
