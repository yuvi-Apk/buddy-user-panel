import { useSyncExternalStore } from "react";
import {
  getTheme,
  setAccent,
  setMode,
  subscribeTheme,
  type ThemeState,
} from "./theme-store";

export interface UseThemeResult extends ThemeState {
  setMode: typeof setMode;
  setAccent: typeof setAccent;
}

/** The current theme choice. The component re-renders when it changes. */
export function useTheme(): UseThemeResult {
  const state = useSyncExternalStore(subscribeTheme, getTheme, getTheme);
  return { ...state, setMode, setAccent };
}
