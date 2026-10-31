import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";

interface CurrentWindow {
  title: string;
  icon: ReactNode;
}

interface WindowManagerState {
  current: CurrentWindow | null;
  setCurrent: (w: CurrentWindow | null) => void;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  maximized: boolean;
  toggleMaximized: () => void;
}

const Ctx = createContext<WindowManagerState | null>(null);

/**
 * Tracks the open window so the taskbar can show its button, and remembers
 * minimize / maximize. Opening another window always restores it.
 */
export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CurrentWindow | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMinimized(false), [pathname]);

  return (
    <Ctx.Provider
      value={{
        current,
        setCurrent,
        minimized,
        setMinimized,
        maximized,
        toggleMaximized: () => setMaximized((m) => !m),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWindowManager must be used inside <WindowManagerProvider>");
  return ctx;
}
