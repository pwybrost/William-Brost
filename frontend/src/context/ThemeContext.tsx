import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

const KEY = "wb_theme";

interface ThemeState {
  /** what the visitor picked */
  mode: ThemeMode;
  /** what is actually shown right now */
  resolved: "light" | "dark";
  setMode: (m: ThemeMode) => void;
  /** flips between light and dark (used by the taskbar button) */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

function readMode(): ThemeMode {
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : "system";
}

/**
 * Light / dark theme. Follows the device setting until the visitor picks one; the choice
 * is saved per browser. index.html applies it before first paint to avoid a flash.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [osDark, setOsDark] = useState(systemDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setOsDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved: "light" | "dark" = mode === "system" ? (osDark ? "dark" : "light") : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", resolved === "dark" ? "#2d2d31" : "#c0c0c0");
  }, [resolved]);

  const setMode = (m: ThemeMode) => {
    if (m === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, m);
    setModeState(m);
  };

  return (
    <ThemeContext.Provider
      value={{ mode, resolved, setMode, toggle: () => setMode(resolved === "dark" ? "light" : "dark") }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
