import type { PointerEventHandler, ReactNode } from "react";

interface TitleBarProps {
  title: string;
  icon?: ReactNode;
  /** extra content on the right, before the window buttons */
  extra?: ReactNode;
  onMinimize?: () => void;
  onMaximize?: () => void;
  maximized?: boolean;
  onClose?: () => void;
  /** lets the window be dragged by its title bar */
  onPointerDown?: PointerEventHandler<HTMLElement>;
  onDoubleClick?: () => void;
  /** heading level for the title (windows that hold a page use a div; the page has its own h1) */
  as?: "h2" | "div";
}

/** Windows 98 title bar. Only buttons with a handler are shown, and all of them work. */
export function TitleBar({
  title,
  icon,
  extra,
  onMinimize,
  onMaximize,
  maximized,
  onClose,
  onPointerDown,
  onDoubleClick,
  as: Heading = "h2",
}: TitleBarProps) {
  return (
    <header className="win-titlebar" onPointerDown={onPointerDown} onDoubleClick={onDoubleClick}>
      {icon && (
        <span aria-hidden className="flex shrink-0">
          {icon}
        </span>
      )}
      <Heading className="min-w-0 flex-1 truncate">{title}</Heading>
      {extra}
      <span className="flex shrink-0 gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
        {onMinimize && (
          <button type="button" className="title-btn" onClick={onMinimize} aria-label="Minimize" title="Minimize">
            <span className="mt-1.5 block h-[2px] w-2 bg-current" aria-hidden />
          </button>
        )}
        {onMaximize && (
          <button
            type="button"
            className="title-btn"
            onClick={onMaximize}
            aria-label={maximized ? "Restore" : "Maximize"}
            title={maximized ? "Restore" : "Maximize"}
          >
            {maximized ? (
              <span className="relative block size-2.5" aria-hidden>
                <span className="absolute top-0 right-0 size-2 border border-t-2 border-current" />
                <span className="absolute bottom-0 left-0 size-2 border border-t-2 border-current bg-face" />
              </span>
            ) : (
              <span className="block size-2.5 border border-t-2 border-current" aria-hidden />
            )}
          </button>
        )}
        {onClose && (
          <button type="button" className="title-btn ml-0.5" onClick={onClose} aria-label="Close" title="Close">
            ×
          </button>
        )}
      </span>
    </header>
  );
}
