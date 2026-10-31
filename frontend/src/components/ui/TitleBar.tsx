import type { ReactNode } from "react";

interface TitleBarProps {
  title: string;
  icon?: ReactNode;
  /** extra content on the right, before the window buttons */
  extra?: ReactNode;
  onMinimize?: () => void;
  minimized?: boolean;
  onMaximize?: () => void;
  maximized?: boolean;
  onClose?: () => void;
}

/** Windows 2000 style title bar. Only buttons with a handler are shown, and they all work. */
export function TitleBar({
  title,
  icon = "▣",
  extra,
  onMinimize,
  minimized,
  onMaximize,
  maximized,
  onClose,
}: TitleBarProps) {
  return (
    <header className="titlebar">
      <span aria-hidden className="text-xs leading-none text-win-sky">
        {icon}
      </span>
      <h2 className="flex-1 truncate">{title}</h2>
      {extra}
      <span className="flex gap-0.5">
        {onMinimize && (
          <button
            type="button"
            className="winbtn"
            onClick={onMinimize}
            aria-label={minimized ? "Restore" : "Minimize"}
            aria-expanded={!minimized}
            title={minimized ? "Restore" : "Minimize"}
          >
            {minimized ? "▫" : "_"}
          </button>
        )}
        {onMaximize && (
          <button
            type="button"
            className="winbtn"
            onClick={onMaximize}
            aria-label={maximized ? "Restore size" : "Maximize"}
            title={maximized ? "Restore size" : "Maximize"}
          >
            {maximized ? "❐" : "□"}
          </button>
        )}
        {onClose && (
          <button type="button" className="winbtn ml-0.5" onClick={onClose} aria-label="Close" title="Close">
            ×
          </button>
        )}
      </span>
    </header>
  );
}
