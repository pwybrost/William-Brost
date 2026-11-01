import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { SECTIONS, sectionFor } from "../../lib/sections";
import { TitleBar } from "../ui/TitleBar";
import { useWindowManager } from "./WindowManager";

interface AppWindowProps {
  /** text in the title bar, e.g. "Projects - Explorer" */
  title: string;
  /** defaults to the icon of the current section */
  icon?: ReactNode;
  /** row under the menu bar: address bar, search, owner buttons... */
  toolbar?: ReactNode;
  /** status bar fields */
  status?: ReactNode[];
  /** where the × button goes (defaults to the home window, or the bare desktop from home) */
  closeTo?: string;
  /** overrides the padded, centred content column */
  contentClassName?: string;
  children: ReactNode;
}

const canDrag = () => window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;

/**
 * The big window every page lives in. Title bar buttons all work: minimize sends it to
 * the taskbar, maximize fills the screen, × closes it. On large screens it can be dragged
 * by the title bar (double-click the title bar to maximize, like Windows).
 */
export function AppWindow({ title, icon, toolbar, status, closeTo, contentClassName, children }: AppWindowProps) {
  const wm = useWindowManager();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const unread = useUnreadCount(isAdmin);
  const section = sectionFor(pathname);
  const windowIcon = icon ?? <section.Icon size={18} />;

  const [minimizing, setMinimizing] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  // Tell the taskbar which window is open.
  const { setCurrent } = wm;
  useEffect(() => {
    setCurrent({ title, icon: windowIcon });
    document.title = title === "William Brost" ? title : `${title} | William Brost`;
    return () => setCurrent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, setCurrent]);

  useEffect(() => setPos({ x: 0, y: 0 }), [wm.maximized]);

  if (wm.minimized) return null;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (wm.maximized || e.button !== 0 || !canDrag()) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    // keep the title bar on screen
    const x = Math.max(-window.innerWidth / 2, Math.min(window.innerWidth / 2, d.ox + e.clientX - d.sx));
    const y = Math.max(-40, Math.min(window.innerHeight - 140, d.oy + e.clientY - d.sy));
    setPos({ x, y });
  };
  const endDrag = () => {
    drag.current = null;
  };

  const close = () => navigate(closeTo ?? (pathname === "/" ? "/desktop" : "/"));
  const visible = SECTIONS.filter((s) => !s.owner || isAdmin);

  const frame = wm.maximized
    ? "fixed inset-x-0 top-0 bottom-12 z-40"
    : "relative mx-auto h-full w-full max-w-[1240px] shadow-[var(--wb-shadow)]";

  return (
    <section
      aria-label={title}
      className={`win-raised flex flex-col p-[3px] ${frame} ${minimizing ? "animate-window-min" : "animate-window-open"}`}
      style={{ translate: `${pos.x}px ${pos.y}px` }}
      onAnimationEnd={() => {
        if (minimizing) {
          setMinimizing(false);
          wm.setMinimized(true);
        }
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={wm.maximized ? "" : "lg:cursor-grab lg:active:cursor-grabbing"}
      >
        <TitleBar
          as="div"
          title={title}
          icon={windowIcon}
          onMinimize={() => setMinimizing(true)}
          onMaximize={wm.toggleMaximized}
          maximized={wm.maximized}
          onClose={close}
          onDoubleClick={wm.toggleMaximized}
        />
      </div>

      {/* Menu bar = site navigation, the same in every window */}
      <nav aria-label="Site" className="flex gap-0.5 overflow-x-auto px-1 py-1">
        {visible.map((s) => (
          <NavLink
            key={s.path}
            to={s.path}
            end={s.path === "/"}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[14px] transition-colors ${
                isActive ? "win-thin font-semibold" : "hover:bg-accent hover:text-accent-fg"
              }`
            }
          >
            <span>
              <u>{s.label[0]}</u>
              {s.label.slice(1)}
            </span>
            {s.path === "/inbox" && unread > 0 && (
              <span className="bg-danger px-1.5 text-[12px] leading-5 font-bold text-white">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {toolbar && <div className="win-divider flex flex-wrap items-center gap-2 px-1 py-1.5 pt-2">{toolbar}</div>}

      <div className="win-sunken relative mt-[2px] min-h-0 flex-1 overflow-y-auto">
        <div className={contentClassName ?? "mx-auto w-full max-w-5xl px-5 py-8 sm:px-10 sm:py-12"}>{children}</div>
      </div>

      {status && status.length > 0 && (
        <div className="mt-[3px] flex gap-[3px] text-[13px]">
          {status.map((s, i) => (
            <span key={i} className={`win-thin truncate px-2 py-1 ${i === 0 ? "flex-1" : "hidden sm:block"}`}>
              {s}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

/** Page heading used at the top of every window: small label, big pixel title, intro text. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-col gap-4 sm:mb-12">
      <p className="eyebrow animate-fade-up">{eyebrow}</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display animate-fade-up text-5xl [animation-delay:60ms] sm:text-6xl">{title}</h1>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {intro && <p className="max-w-2xl animate-fade-up text-[17px] text-muted [animation-delay:120ms]">{intro}</p>}
      <hr className="win-divider mt-2" />
    </header>
  );
}

/** Message shown in a window while data loads or when it fails. */
export function WindowMessage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-64 items-center justify-center text-center text-[15px] text-muted">{children}</div>;
}
