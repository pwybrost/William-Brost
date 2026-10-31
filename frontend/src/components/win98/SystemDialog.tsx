import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TitleBar } from "../ui/TitleBar";
import { CheckIcon, ErrorIcon, WarningIcon } from "./Icons";

type Kind = "confirm" | "error" | "info";

interface DialogOptions {
  title?: string;
  message: string;
  /** button labels, e.g. ["Yes", "No"] */
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
  info: "Setup",
};

/**
 * Windows 98 message boxes (warning / error / completed) that replace the browser's
 * plain confirm() and alert() popups.
 */
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
        onCancel={(e) => {
          e.preventDefault();
          finish(false);
        }}
        className="win98 win-raised m-auto w-[calc(100%-2rem)] max-w-sm p-[3px] backdrop:bg-black/40"
      >
        {req && (
          <>
            <TitleBar title={req.title ?? DEFAULT_TITLES[req.kind]} icon={null} onClose={() => finish(false)} />
            <div className="flex items-center gap-4 px-4 pt-5 pb-4">
              {ICONS[req.kind]}
              <p className="text-[12px] whitespace-pre-line">{req.message}</p>
            </div>
            <div className="flex justify-center gap-2 pb-3">
              {req.kind === "confirm" ? (
                <>
                  <button type="button" className="win-button min-w-20" onClick={() => finish(true)} autoFocus>
                    <span>
                      <u>{(req.okLabel ?? "Yes")[0]}</u>
                      {(req.okLabel ?? "Yes").slice(1)}
                    </span>
                  </button>
                  <button type="button" className="win-button min-w-20" onClick={() => finish(false)}>
                    <span>
                      <u>{(req.cancelLabel ?? "No")[0]}</u>
                      {(req.cancelLabel ?? "No").slice(1)}
                    </span>
                  </button>
                </>
              ) : (
                <button type="button" className="win-button min-w-20" onClick={() => finish(true)} autoFocus>
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
