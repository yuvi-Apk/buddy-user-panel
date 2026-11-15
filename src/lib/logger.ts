// The app's only door to the console (core-rules #19). It writes in development builds only; a
// production build stays silent until an error tracker is chosen.
//
//   logger.warn("Response did not match its schema", { path: "/user/auth/me" });
//
// Details are flat values on purpose: never pass a token, an email, a name, an answer or a whole
// response, because the people using Buddy are often minors on shared devices.
import { env } from "@/config/env";

export type LogDetails = Record<
  string,
  string | number | boolean | null | undefined
>;

type Level = "debug" | "info" | "warn" | "error";

function write(level: Level, message: string, details?: LogDetails): void {
  if (!env.isDev || env.isTest) return;
  if (details) console[level](`[buddy] ${message}`, details);
  else console[level](`[buddy] ${message}`);
}

export const logger = {
  debug: (message: string, details?: LogDetails) =>
    write("debug", message, details),
  info: (message: string, details?: LogDetails) =>
    write("info", message, details),
  warn: (message: string, details?: LogDetails) =>
    write("warn", message, details),
  error: (message: string, details?: LogDetails) =>
    write("error", message, details),
};
