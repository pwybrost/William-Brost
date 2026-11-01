import type { ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { EditorsProvider } from "../../features/editors/EditorsProvider";
import { SECTIONS } from "../../lib/sections";
import { Taskbar } from "./Taskbar";
import { Wallpaper } from "./Wallpaper";
import { WindowManagerProvider } from "./WindowManager";

/**
 * The whole site after sign-in: wallpaper, desktop icons on the left (large screens),
 * the open window in the middle, and the taskbar at the bottom.
 */
export function Desktop() {
  const { pathname } = useLocation();
  return (
    <WindowManagerProvider>
      <EditorsProvider>
        <Wallpaper />
        <div className="flex h-dvh flex-col">
          <div className="flex min-h-0 flex-1">
            <DesktopIcons className="hidden lg:flex" />
            <main className="relative flex min-h-0 min-w-0 flex-1 p-0 sm:p-3 lg:p-6 lg:pl-2">
              {/* key: every window plays its open animation when you navigate */}
              <div key={pathname} className="flex min-h-0 w-full">
                <Outlet />
              </div>
            </main>
          </div>
          <Taskbar />
        </div>
      </EditorsProvider>
    </WindowManagerProvider>
  );
}

/** Column of desktop shortcuts. Single click opens (easier than double-click on the web). */
export function DesktopIcons({ className = "", grid }: { className?: string; grid?: boolean }) {
  const { isAdmin } = useAuth();
  return (
    <nav
      aria-label="Desktop shortcuts"
      className={`${className} ${
        grid ? "grid grid-cols-3 gap-3 sm:grid-cols-4" : "w-28 shrink-0 flex-col gap-1 overflow-y-auto px-2 py-4"
      }`}
    >
      {SECTIONS.filter((s) => !s.owner || isAdmin).map((s, i) => (
        <DesktopIcon key={s.path} to={s.path} label={s.label} index={i}>
          <s.Icon size={40} />
        </DesktopIcon>
      ))}
    </nav>
  );
}

function DesktopIcon({
  to,
  label,
  index,
  children,
}: {
  to: string;
  label: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      style={{ animationDelay: `${index * 40}ms` }}
      className="group flex animate-fade-up flex-col items-center gap-1.5 p-2 text-center focus:outline-none"
    >
      <span className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-95">
        {children}
      </span>
      <span className="px-1 text-[13px] leading-tight text-white [text-shadow:1px_1px_0_#000,0_0_4px_#000] group-hover:bg-accent group-hover:[text-shadow:none] group-focus-visible:bg-accent group-focus-visible:outline group-focus-visible:outline-1 group-focus-visible:outline-dotted group-focus-visible:[text-shadow:none] group-aria-[current=page]:bg-accent group-aria-[current=page]:[text-shadow:none]">
        {label}
      </span>
    </NavLink>
  );
}
