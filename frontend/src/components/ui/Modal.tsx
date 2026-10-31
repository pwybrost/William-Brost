import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TitleBar } from "./TitleBar";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  icon?: ReactNode;
}

/**
 * A Windows 98 dialog built on the native <dialog> element (focus trapping and
 * Esc-to-close come for free). The maximize button really maximizes.
 */
export function Modal({ open, title, onClose, children, wide, icon }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) setMaximized(false);
  }, [open]);

  const size = maximized
    ? "h-[calc(100dvh-1rem)] max-h-none w-[calc(100%-1rem)] max-w-none"
    : `max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] ${wide ? "max-w-3xl" : "max-w-lg"}`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={`win-raised m-auto flex-col p-[3px] shadow-[var(--wb-shadow)] backdrop:bg-black/45 open:flex open:animate-pop ${size}`}
    >
      {open && (
        <>
          <TitleBar
            title={title}
            icon={icon}
            onMaximize={() => setMaximized((m) => !m)}
            maximized={maximized}
            onClose={onClose}
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
        </>
      )}
    </dialog>
  );
}
