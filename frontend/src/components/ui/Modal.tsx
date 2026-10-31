import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

/** Uses the native <dialog> element: focus trapping and Esc-to-close come for free. */
export function Modal({ open, title, onClose, children, wide }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={`bevel m-auto w-[calc(100%-2rem)] p-1 backdrop:bg-black/70 backdrop:backdrop-blur-[1px] ${
        wide ? "max-w-3xl" : "max-w-lg"
      }`}
    >
      {open && (
        <>
          <header className="flex items-center gap-3 bg-body px-3 py-1.5 text-silver-light">
            <span className="size-2 animate-blink rounded-full bg-rec" aria-hidden />
            <h2 className="label flex-1 truncate">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="label cursor-pointer px-1 hover:text-rec"
              aria-label="Close"
            >
              [X]
            </button>
          </header>
          <div className="lcd bevel-inset mt-1 max-h-[80dvh] overflow-y-auto p-5">{children}</div>
        </>
      )}
    </dialog>
  );
}
