import { useNavigate } from "react-router";
import { TitleBar } from "../components/ui/TitleBar";
import { Wallpaper } from "../components/shell/Wallpaper";
import { ErrorIcon } from "../components/win98/Icons";

/** 404 as a Windows error message box. */
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <>
      <Wallpaper />
      <main className="flex min-h-dvh items-center justify-center p-4">
        <section
          role="alertdialog"
          aria-labelledby="nf-msg"
          className="win-raised w-full max-w-md animate-pop p-[3px] shadow-[var(--wb-shadow)]"
        >
          <TitleBar title="Error" onClose={() => navigate("/")} />
          <div className="flex items-center gap-4 px-5 pt-6 pb-5">
            <ErrorIcon size={40} />
            <div>
              <h1 className="text-[17px] font-semibold">File not found (404)</h1>
              <p id="nf-msg" className="text-[15px] text-muted">
                This page doesn't exist or was moved.
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-2 pb-4">
            <button type="button" className="win-button-primary min-w-24" onClick={() => navigate("/")} autoFocus>
              OK
            </button>
            <button type="button" className="win-button min-w-24" onClick={() => navigate(-1)}>
              Go back
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
