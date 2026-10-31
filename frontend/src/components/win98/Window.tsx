import { useState } from "react";
import type { ReactNode } from "react";
import { TitleBar } from "../ui/TitleBar";

export interface MenuItem {
  label: string;
  /** without onClick it's a plain label, like an inactive menu */
  onClick?: () => void;
}

interface WindowProps {
  title: string;
  icon?: ReactNode;
  /** anchor id so the taskbar / Start menu can jump to this window */
  id?: string;
  /** menu row ("File  Edit  View  Help") */
  menu?: MenuItem[];
  /** toolbar row under the menu (buttons, address bar...) */
  toolbar?: ReactNode;
  /** "white" = Notepad/Explorer page, "black" = Command Prompt/Player, "face" = grey dialog */
  body?: "white" | "black" | "face";
  bodyClassName?: string;
  /** status bar fields */
  status?: ReactNode[];
  className?: string;
  children: ReactNode;
}

const BODY: Record<NonNullable<WindowProps["body"]>, string> = {
  white: "win-sunken bg-white text-black",
  black: "win-sunken bg-black! text-[#c0c0c0]",
  face: "",
};

/** A Windows 98 window. Minimize really collapses it (and restores from the taskbar button). */
export function Window({
  title,
  icon,
  id,
  menu,
  toolbar,
  body = "white",
  bodyClassName = "",
  status,
  className = "",
  children,
}: WindowProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <section id={id} className={`win-raised flex scroll-mt-24 flex-col p-[3px] ${className}`}>
      <TitleBar title={title} icon={icon} minimized={minimized} onMinimize={() => setMinimized((m) => !m)} />
      {!minimized && (
        <>
          {menu && menu.length > 0 && (
            <nav className="flex flex-wrap gap-0.5 px-1 py-0.5 text-[12px]">
              {menu.map((m) =>
                m.onClick ? (
                  <button
                    key={m.label}
                    type="button"
                    onClick={m.onClick}
                    className="cursor-pointer px-1.5 py-0.5 hover:bg-[#000080] hover:text-white"
                  >
                    <u>{m.label[0]}</u>
                    {m.label.slice(1)}
                  </button>
                ) : (
                  <span key={m.label} className="cursor-default px-1.5 py-0.5 text-[#404040]">
                    <u>{m.label[0]}</u>
                    {m.label.slice(1)}
                  </span>
                ),
              )}
            </nav>
          )}
          {toolbar && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-[#808080] px-1 py-1 shadow-[inset_0_1px_#fff]">
              {toolbar}
            </div>
          )}
          <div className={`relative mt-[2px] flex-1 ${BODY[body]} ${body === "face" ? "" : "p-3"} ${bodyClassName}`}>
            {children}
          </div>
          {status && status.length > 0 && (
            <div className="mt-[2px] flex gap-[2px] text-[11px]">
              {status.map((s, i) => (
                <span key={i} className={`win-thin truncate px-2 py-0.5 ${i === 0 ? "flex-1" : ""}`}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** Grey icon-style toolbar button (← → ⌂ ...). */
export function ToolButton({
  children,
  label,
  onClick,
  disabled,
  pressed,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="win-button min-h-[26px] min-w-[26px] px-1.5 text-[13px]"
    >
      {children}
    </button>
  );
}

/** "Address" style sunken text box. */
export function AddressBar({ label = "Address", children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[12px]">
      <span className="text-[#404040]">{label}</span>
      <div className="win-sunken flex min-w-0 flex-1 items-center gap-1.5 px-1.5 py-[3px]">{children}</div>
    </div>
  );
}
