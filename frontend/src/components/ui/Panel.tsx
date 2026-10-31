import { useState } from "react";
import type { ReactNode } from "react";
import { TitleBar } from "./TitleBar";

interface PanelProps {
  title: string;
  icon?: ReactNode;
  /** buttons shown in the toolbar strip under the title bar */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** text shown in the bottom status bar */
  status?: ReactNode;
  /** remove the body padding (for edge-to-edge lists) */
  flush?: boolean;
}

/**
 * A Windows 2000 style window: title bar (with a working minimize button), optional toolbar,
 * green LCD body and optional status bar.
 */
export function Panel({
  title,
  icon,
  actions,
  children,
  className = "",
  bodyClassName = "",
  status,
  flush,
}: PanelProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <section className={`bevel flex flex-col p-[3px] ${className}`}>
      <TitleBar
        title={title}
        icon={icon}
        minimized={minimized}
        onMinimize={() => setMinimized((m) => !m)}
      />
      {!minimized && (
        <>
          {actions && <div className="menubar">{actions}</div>}
          <div className={`lcd bevel-inset scanlines mt-[3px] flex-1 ${flush ? "" : "p-5"} ${bodyClassName}`}>
            <div className="relative z-[2]">{children}</div>
          </div>
          {status && (
            <div className="statusbar">
              <span className="flex-1">{status}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
