import { FolderIcon } from "./Icons";

/**
 * Windows 98 "Saving (55%)" box: a file flies between two folders above a
 * blocky progress bar. `percent` = null shows an indeterminate bar.
 */
export function SavingProgress({ percent, label = "Saving" }: { percent: number | null; label?: string }) {
  const pct = percent === null ? null : Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="win-raised flex flex-col gap-2 p-3 text-[14px]" role="status" aria-live="polite">
      <span className="font-semibold">
        {label}
        {pct !== null ? ` (${pct}%)` : "..."}
      </span>
      <div className="flex items-center gap-2">
        <FolderIcon size={24} />
        <span className="h-0 flex-1 border-t-2 border-dashed border-line" />
        <FolderIcon size={24} open />
      </div>
      <div className="win-sunken h-5 p-[3px]">
        <div
          className={`h-full bg-[repeating-linear-gradient(90deg,var(--wb-accent)_0_10px,transparent_10px_12px)] ${
            pct === null ? "animate-progress" : "transition-[width] duration-200"
          }`}
          style={pct === null ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
