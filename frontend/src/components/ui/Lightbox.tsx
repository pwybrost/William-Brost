import { useEffect, useRef } from "react";
import { mediaUrl } from "../../lib/api";
import type { ProjectImage } from "../../lib/types";
import { PictureIcon } from "../win98/Icons";
import { TitleBar } from "./TitleBar";

interface Props {
  images: ProjectImage[];
  /** index of the open image, or null when closed */
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

/** Full-screen image viewer styled like the Windows 98 media player. ← → keys browse. */
export function Lightbox({ images, index, onIndexChange }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null && images.length > 0;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const go = (to: number) => onIndexChange((to + images.length) % images.length);
  const image = index !== null ? images[index] : undefined;
  const n = (index ?? 0) + 1;

  return (
    <dialog
      ref={ref}
      aria-label="Image viewer"
      onClose={() => onIndexChange(null)}
      onKeyDown={(e) => {
        if (index === null) return;
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      className="win-raised m-auto h-[calc(100dvh-1.5rem)] max-h-none w-[calc(100%-1.5rem)] max-w-7xl flex-col p-[3px] backdrop:bg-black/85 open:flex open:animate-pop"
    >
      {image && index !== null && (
        <>
          <TitleBar
            title={`Image Viewer - ${image.caption || `IMG_${String(n).padStart(4, "0")}.JPG`}`}
            icon={<PictureIcon size={16} />}
            onClose={() => onIndexChange(null)}
          />
          <div className="relative mt-[3px] flex min-h-0 flex-1 items-center justify-center bg-black p-2">
            {/* key restarts the fade-in for every image */}
            <img
              key={image.mediaId}
              src={mediaUrl(image.mediaId) ?? ""}
              alt={image.caption}
              className="max-h-full max-w-full animate-pop object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 px-2 pt-2 pb-1">
            <button type="button" className="win-button px-3" onClick={() => go(0)} aria-label="First image">
              ⏮
            </button>
            <button type="button" className="win-button px-3" onClick={() => go(index - 1)} aria-label="Previous image">
              ◀
            </button>
            <button type="button" className="win-button px-3" onClick={() => go(index + 1)} aria-label="Next image">
              ▶
            </button>
            <button
              type="button"
              className="win-button px-3"
              onClick={() => go(images.length - 1)}
              aria-label="Last image"
            >
              ⏭
            </button>
            <input
              type="range"
              min={1}
              max={images.length}
              value={n}
              onChange={(e) => go(Number(e.target.value) - 1)}
              aria-label="Image position"
              className="min-w-32 flex-1 accent-[var(--wb-accent)]"
            />
            <span className="win-thin px-2 py-1 font-mono text-[13px]">
              {n} / {images.length}
            </span>
          </div>
        </>
      )}
    </dialog>
  );
}
