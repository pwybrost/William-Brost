import { HourglassIcon } from "../win98/Icons";
import { Wallpaper } from "./Wallpaper";

/** Small "Please wait..." box with a turning hourglass. */
export function PleaseWait({ text = "Please wait..." }: { text?: string }) {
  return (
    <div role="status" className="win-raised flex animate-pop items-center gap-4 px-6 py-5 text-[15px]">
      <HourglassIcon className="animate-hourglass" />
      {text}
    </div>
  );
}

/** Full-screen loading state (used before the desktop is ready). */
export function LoadingScreen({ text }: { text?: string }) {
  return (
    <>
      <Wallpaper />
      <div className="flex min-h-dvh items-center justify-center p-4">
        <PleaseWait text={text} />
      </div>
    </>
  );
}
