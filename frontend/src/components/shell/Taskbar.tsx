import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useEditMode } from "../../context/EditModeContext";
import { useTheme, type ThemeMode } from "../../context/ThemeContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { SECTIONS } from "../../lib/sections";
import { ThemeIcon, WindowsLogo } from "../win98/Icons";
import { useWindowManager } from "./WindowManager";

const THEMES: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "Match my device" },
];

/** Bottom taskbar: Start menu, the open window's button, and the tray (theme, owner tools, clock). */
export function Taskbar() {
  const wm = useWindowManager();
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const { editing, toggle: toggleEdit } = useEditMode();
  const unread = useUnreadCount(isAdmin);

  return (
    <footer className="win-raised relative z-50 flex h-12 shrink-0 items-center gap-1.5 px-1.5">
      <StartMenu />
      <span className="h-8 w-px bg-line shadow-[1px_0_var(--wb-hi)]" aria-hidden />

      <div className="flex min-w-0 flex-1">
        {wm.current && (
          <button
            type="button"
            aria-pressed={!wm.minimized}
            onClick={() => wm.setMinimized(!wm.minimized)}
            title={wm.minimized ? "Restore window" : "Minimize window"}
            className="win-button max-w-64 min-w-0 justify-start px-2.5"
          >
            <span className="flex shrink-0">{wm.current.icon}</span>
            <span className="truncate">{wm.current.title}</span>
          </button>
        )}
      </div>

      <div className="win-thin flex h-9 shrink-0 items-center gap-1 px-1.5">
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={toggleEdit}
              aria-pressed={editing}
              title={editing ? "Edit mode is on. Click to see the site as visitors do." : "Turn edit mode on"}
              className={`flex h-7 cursor-pointer items-center gap-1 px-2 text-[13px] hover:bg-accent hover:text-accent-fg ${
                editing ? "font-semibold" : "text-muted"
              }`}
            >
              ✎ <span className="hidden sm:inline">{editing ? "Editing" : "Visitor view"}</span>
            </button>
            <Link
              to="/inbox"
              title={`${unread} unread message(s)`}
              className="flex h-7 items-center gap-1 px-2 text-[13px] hover:bg-accent hover:text-accent-fg"
            >
              ✉{unread > 0 && <span className="bg-danger px-1 text-[11px] font-bold text-white">{unread}</span>}
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={theme.toggle}
          aria-label={theme.resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme.resolved === "dark" ? "Light mode" : "Dark mode"}
          className="flex h-7 cursor-pointer items-center px-2 hover:bg-accent hover:text-accent-fg"
        >
          <ThemeIcon dark={theme.resolved === "light"} size={16} />
        </button>
        <Clock />
      </div>
    </footer>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  return (
    <time dateTime={now.toISOString()} className="hidden px-2 text-[13px] sm:block">
      {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
    </time>
  );
}

function StartMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { editing, toggle: toggleEdit } = useEditMode();
  const theme = useTheme();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  // Close when clicking elsewhere; focus the first item when it opens.
  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>("[role^=menuitem]")?.focus();
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ↑ ↓ move between items, Esc closes (standard menu keyboard behaviour).
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") return close();
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[role^=menuitem]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  };

  const go = (path: string) => {
    close(false);
    navigate(path);
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="win-button px-3 font-bold"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-pressed={open}
        onClick={() => setOpen((o) => !o)}
      >
        <WindowsLogo size={18} />
        Start
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Start"
          className="win-raised absolute bottom-full left-0 mb-1 flex w-72 animate-pop p-[3px] text-[15px] shadow-[var(--wb-shadow)]"
        >
          <div className="flex w-9 shrink-0 items-end justify-center bg-linear-to-t from-[var(--wb-title-1)] to-[var(--wb-title-2)] pb-3">
            <span className="rotate-180 text-[17px] font-bold whitespace-nowrap text-white [writing-mode:vertical-rl]">
              William <span className="font-normal">Brost</span>
            </span>
          </div>
          <div className="min-w-0 flex-1 py-1">
            {SECTIONS.filter((s) => !s.owner).map((s) => (
              <MenuItem key={s.path} icon={<s.Icon size={22} />} onClick={() => go(s.path)}>
                {s.label}
              </MenuItem>
            ))}
            <Separator />
            {isAdmin && (
              <>
                {SECTIONS.filter((s) => s.owner).map((s) => (
                  <MenuItem key={s.path} icon={<s.Icon size={22} />} onClick={() => go(s.path)}>
                    {s.label}
                  </MenuItem>
                ))}
                <MenuItem icon={<span className="w-[22px] text-center">✎</span>} checked={editing} onClick={toggleEdit}>
                  Edit mode
                </MenuItem>
                <Separator />
              </>
            )}
            <p className="px-3 pt-1 pb-0.5 text-[12px] text-muted" id="start-theme">
              Display
            </p>
            <div role="group" aria-labelledby="start-theme">
              {THEMES.map((t) => (
                <MenuItem
                  key={t.mode}
                  radio
                  checked={theme.mode === t.mode}
                  icon={<span className="w-[22px] text-center">{theme.mode === t.mode ? "●" : ""}</span>}
                  onClick={() => theme.setMode(t.mode)}
                >
                  {t.label}
                </MenuItem>
              ))}
            </div>
            <Separator />
            <MenuItem
              icon={<span className="w-[22px] text-center">⏻</span>}
              onClick={async () => {
                close(false);
                await logout();
                navigate("/auth", { replace: true });
              }}
            >
              {user ? `Log Off ${user.displayName}...` : "Sign in..."}
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  checked,
  radio,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  checked?: boolean;
  radio?: boolean;
}) {
  const role = checked === undefined ? "menuitem" : radio ? "menuitemradio" : "menuitemcheckbox";
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-fg focus:bg-accent focus:text-accent-fg focus:outline-none"
    >
      <span className="flex shrink-0">{icon}</span>
      <span className="truncate">{children}</span>
      {checked !== undefined && !radio && <span className="ml-auto">{checked ? "✓" : ""}</span>}
    </button>
  );
}

function Separator() {
  return <hr className="win-divider mx-1 my-1" />;
}
