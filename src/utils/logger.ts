// The app's only door to the console. It writes in development builds only; a
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

type LogLevel = "debug" | "info" | "warn" | "error";

function writeLog(
  level: LogLevel,
  message: string,
  details?: LogDetails
): void {
  if (!env.isDev || env.isTest) return;
  if (details) console[level](`[buddy] ${message}`, details);
  else console[level](`[buddy] ${message}`);
}

export const logger = {
  debug: (message: string, details?: LogDetails) =>
    writeLog("debug", message, details),
  info: (message: string, details?: LogDetails) =>
    writeLog("info", message, details),
  warn: (message: string, details?: LogDetails) =>
    writeLog("warn", message, details),
  error: (message: string, details?: LogDetails) =>
    writeLog("error", message, details),
};
