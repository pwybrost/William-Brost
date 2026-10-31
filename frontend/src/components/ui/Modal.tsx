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
 * A Windows 2000 style dialog window built on the native <dialog> element
 * (focus trapping and Esc-to-close come for free). The maximize button really maximizes.
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
    : `w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-lg"}`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={`bevel m-auto flex-col p-[3px] backdrop:bg-black/70 backdrop:backdrop-blur-[1px] open:flex ${size}`}
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
          <div className={`modal-body mt-[3px] overflow-y-auto p-5 ${maximized ? "flex-1" : "max-h-[78dvh]"}`}>
            {children}
          </div>
          <div className="statusbar">
            <span className="flex-1">Ready</span>
            <span>Esc = close</span>
          </div>
        </>
      )}
    </dialog>
  );
}
