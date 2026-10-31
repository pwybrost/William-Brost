import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  /** buttons shown on the right side of the title bar */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** A window with a title bar, styled like an old camera menu screen / desktop app. */
export function Panel({ title, actions, children, className = "", bodyClassName = "" }: PanelProps) {
  return (
    <section className={`bevel p-1 ${className}`}>
      <header className="flex items-center gap-3 bg-body px-3 py-1.5 text-silver-light">
        <span className="flex gap-1" aria-hidden>
          <span className="size-2 rounded-full bg-rec" />
          <span className="size-2 rounded-full bg-amber" />
          <span className="size-2 rounded-full bg-phosphor" />
        </span>
        <h2 className="label flex-1 truncate">{title}</h2>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className={`lcd bevel-inset scanlines mt-1 p-5 ${bodyClassName}`}>
        <div className="relative z-[2]">{children}</div>
      </div>
    </section>
  );
}
