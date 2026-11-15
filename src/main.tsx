import "@/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app";
import { startThemeSync } from "@/theme";

const container = document.getElementById("root");
if (!container) throw new Error("index.html has no #root element.");

startThemeSync();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
