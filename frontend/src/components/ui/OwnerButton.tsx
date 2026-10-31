import type { ButtonHTMLAttributes } from "react";

/** Small owner-only action button ("Edit...", "Delete"). Render it only in edit mode. */
export function OwnerButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`win-button min-h-8 px-3 text-[13px] ${className}`} {...props} />;
}
