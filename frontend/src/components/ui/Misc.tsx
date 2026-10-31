import type { ButtonHTMLAttributes } from "react";
import { useClock } from "../../hooks/useClock";

/** Orange camera date stamp, e.g. `'26 10 31  14:05` */
export function DateStamp({ className = "" }: { className?: string }) {
  const { date, time } = useClock();
  return (
    <span className={`stamp text-xl ${className}`}>
      {date}&nbsp;&nbsp;{time}
    </span>
  );
}

export function RecDot({ label = "REC" }: { label?: string }) {
  return (
    <span className="label inline-flex items-center gap-1.5 text-rec">
      <span className="size-2.5 animate-blink rounded-full bg-rec shadow-[0_0_8px_#ff2d2d]" aria-hidden />
      {label}
    </span>
  );
}

export function Battery() {
  return (
    <span className="inline-flex items-center" aria-label="Battery full">
      <span className="flex h-3 w-6 gap-[2px] border border-current p-[2px]">
        <span className="flex-1 bg-current" />
        <span className="flex-1 bg-current" />
        <span className="flex-1 bg-current" />
      </span>
      <span className="h-1.5 w-[3px] bg-current" />
    </span>
  );
}

export function LoadingScreen({ text = "LOADING" }: { text?: string }) {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <p className="font-display text-3xl text-phosphor glow">
        {text}
        <span className="animate-blink">_</span>
      </p>
    </div>
  );
}

/** Small edit button; only render it when the owner is in edit mode. */
export function EditButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="btn-lcd px-2.5 py-1 text-[10px] text-amber" {...props}>
      {props.children ?? "✎ Edit"}
    </button>
  );
}
