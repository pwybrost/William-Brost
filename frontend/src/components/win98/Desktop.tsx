import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { ComputerIcon, WindowsLogo } from "./Icons";

export interface TaskItem {
  /** id of the window element to scroll to */
  id: string;
  label: string;
  icon?: ReactNode;
}

interface DesktopProps {
  children: ReactNode;
  /** windows listed on the taskbar and in the Start menu */
  tasks?: TaskItem[];
}

/**
 * Teal Windows 98 desktop with a taskbar. Everything inside uses the `.win98` theme,
 * so shared components (fields, editors, dialogs) switch to the grey Windows look.
 */
export function Desktop({ children, tasks = [] }: DesktopProps) {
  return (
    <div className="win98 flex min-h-[calc(100dvh-8rem)] flex-col bg-desktop">
      <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4">{children}</div>
      <Taskbar tasks={tasks} />
    </div>
  );
}

function Taskbar({ tasks }: { tasks: TaskItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  // Close the Start menu when clicking anywhere else or pressing Esc.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const jump = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <footer className="win-raised sticky bottom-0 z-20 flex items-center gap-1 px-1 py-[3px]">
      <div ref={menuRef} className="relative">
        <button
          type="button"
          className="win-button px-2 font-bold"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-pressed={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <WindowsLogo />
          Start
        </button>

        {menuOpen && (
          <div role="menu" className="win-raised absolute bottom-full left-0 mb-1 flex w-60 p-[3px] text-[12px]">
            <div className="flex w-7 items-end justify-center bg-linear-to-t from-[#000080] to-[#1084d0] pb-2">
              <span className="rotate-180 font-bold whitespace-nowrap text-white [writing-mode:vertical-rl]">
                William<span className="font-normal">Brost</span>
              </span>
            </div>
            <ul className="flex-1">
              {tasks.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => jump(t.id)}
                    className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left hover:bg-[#000080] hover:text-white"
                  >
                    {t.icon}
                    {t.label}
                  </button>
                </li>
              ))}
              {tasks.length > 0 && <li className="mx-1 my-1 border-t border-[#808080] shadow-[0_1px_#fff]" />}
              <StartItem onClick={() => go("/portfolio")}>Portfolio</StartItem>
              <StartItem onClick={() => go("/")}>Home (dashboard)</StartItem>
              {isAdmin && <StartItem onClick={() => go("/inbox")}>Inbox</StartItem>}
              <li className="mx-1 my-1 border-t border-[#808080] shadow-[0_1px_#fff]" />
              <StartItem
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  navigate("/auth", { replace: true });
                }}
              >
                {user ? `Log Off ${user.displayName}...` : "Sign in..."}
              </StartItem>
            </ul>
          </div>
        )}
      </div>

      <div className="mx-1 h-6 w-px bg-[#808080] shadow-[1px_0_#fff]" />

      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => jump(t.id)}
            className="win-button max-w-40 shrink-0 justify-start truncate px-2 text-[11px]"
          >
            {t.icon}
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      <TrayClock />
    </footer>
  );
}

function StartItem({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <li>
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left hover:bg-[#000080] hover:text-white"
      >
        <ComputerIcon size={16} />
        {children}
      </button>
    </li>
  );
}

function TrayClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="win-thin hidden shrink-0 px-3 py-1 text-[11px] sm:inline">
      {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
    </span>
  );
}
