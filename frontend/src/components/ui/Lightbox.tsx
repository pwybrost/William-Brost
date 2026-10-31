import { useEffect, useRef } from "react";
import { mediaUrl } from "../../lib/api";
import type { ProjectImage } from "../../lib/types";
import { TitleBar } from "./TitleBar";

interface Props {
  images: ProjectImage[];
  /** index of the open image, or null when closed */
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

/** Full-screen image viewer, styled like a camera's playback mode. ← → keys browse. */
export function Lightbox({ images, index, onIndexChange }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null && images.length > 0;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const go = (dir: -1 | 1) => {
    if (index === null) return;
    onIndexChange((index + dir + images.length) % images.length);
  };

  const image = index !== null ? images[index] : undefined;
  const frame = index !== null ? String(index + 1).padStart(4, "0") : "";

  return (
    <dialog
      ref={ref}
      onClose={() => onIndexChange(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      className="bevel m-auto h-[calc(100dvh-2rem)] max-h-none w-[calc(100%-2rem)] max-w-6xl flex-col p-[3px] backdrop:bg-black/85 open:flex"
    >
      {image && (
        <>
          <TitleBar
            title={`IMG_${frame}.JPG  (${(index ?? 0) + 1}/${images.length})`}
            icon="▶"
            onClose={() => onIndexChange(null)}
          />
          <div className="lcd scanlines bevel-inset relative mt-[3px] flex min-h-0 flex-1 items-center justify-center bg-black">
            <img
              src={mediaUrl(image.mediaId) ?? ""}
              alt={image.caption}
              className="relative z-0 max-h-full max-w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="btn absolute top-1/2 left-3 z-[3] -translate-y-1/2"
                  aria-label="Previous image"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="btn absolute top-1/2 right-3 z-[3] -translate-y-1/2"
                  aria-label="Next image"
                >
                  ▶
                </button>
              </>
            )}
            <span className="stamp absolute right-4 bottom-2 z-[3] text-xl">100-{frame}</span>
          </div>
          <div className="statusbar">
            <span className="flex-1 truncate">{image.caption || "No caption"}</span>
            <span>← → to browse</span>
          </div>
        </>
      )}
    </dialog>
  );
}
