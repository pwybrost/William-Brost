import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TitleBar } from "../ui/TitleBar";
import { CheckIcon, ErrorIcon, WarningIcon } from "./Icons";

type Kind = "confirm" | "error" | "info";

interface DialogOptions {
  title?: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
}

interface Request extends DialogOptions {
  kind: Kind;
  resolve: (ok: boolean) => void;
}

interface SystemDialogApi {
  /** Yes/No warning dialog. Resolves true when the user clicks Yes. */
  confirm: (o: DialogOptions) => Promise<boolean>;
  /** Red-X error dialog with an OK button. */
  error: (o: DialogOptions) => Promise<void>;
  /** Green-check "completed" dialog with an OK button. */
  info: (o: DialogOptions) => Promise<void>;
}

const Ctx = createContext<SystemDialogApi | null>(null);

const ICONS: Record<Kind, ReactNode> = {
  confirm: <WarningIcon />,
  error: <ErrorIcon />,
  info: <CheckIcon />,
};

const DEFAULT_TITLES: Record<Kind, string> = {
  confirm: "Confirm",
  error: "Error",
  info: "William Brost",
};

/** Windows 98 message boxes that replace the browser's plain confirm() and alert(). */
export function SystemDialogProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<Request | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (req && !d.open) d.showModal();
    if (!req && d.open) d.close();
  }, [req]);

  const ask = useCallback(
    (kind: Kind, o: DialogOptions) => new Promise<boolean>((resolve) => setReq({ ...o, kind, resolve })),
    [],
  );

  const finish = (ok: boolean) => {
    req?.resolve(ok);
    setReq(null);
  };

  const [api] = useState<SystemDialogApi>(() => ({
    confirm: (o) => ask("confirm", o),
    error: (o) => ask("error", o).then(() => undefined),
    info: (o) => ask("info", o).then(() => undefined),
  }));

  return (
    <Ctx.Provider value={api}>
      {children}
      <dialog
        ref={ref}
        role="alertdialog"
        aria-describedby="system-dialog-message"
        onCancel={(e) => {
          e.preventDefault();
          finish(false);
        }}
        className="win-raised m-auto w-[calc(100%-2rem)] max-w-md p-[3px] shadow-[var(--wb-shadow)] backdrop:bg-black/40 open:animate-pop"
      >
        {req && (
          <>
            <TitleBar title={req.title ?? DEFAULT_TITLES[req.kind]} onClose={() => finish(false)} />
            <div className="flex items-center gap-4 px-5 pt-6 pb-5">
              {ICONS[req.kind]}
              <p id="system-dialog-message" className="text-[15px] whitespace-pre-line">
                {req.message}
              </p>
            </div>
            <div className="flex justify-center gap-2 pb-4">
              {req.kind === "confirm" ? (
                <>
                  <button type="button" className="win-button-primary min-w-24" onClick={() => finish(true)} autoFocus>
                    {req.okLabel ?? "Yes"}
                  </button>
                  <button type="button" className="win-button min-w-24" onClick={() => finish(false)}>
                    {req.cancelLabel ?? "No"}
                  </button>
                </>
              ) : (
                <button type="button" className="win-button-primary min-w-24" onClick={() => finish(true)} autoFocus>
                  {req.okLabel ?? "OK"}
                </button>
              )}
            </div>
          </>
        )}
      </dialog>
    </Ctx.Provider>
  );
}

export function useSystemDialog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSystemDialog must be used inside <SystemDialogProvider>");
  return ctx;
}
