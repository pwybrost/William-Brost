import { useEffect, useRef } from "react";
import { mediaUrl } from "../../lib/api";
import type { ProjectImage } from "../../lib/types";
import { PictureIcon } from "../win98/Icons";
import { ToolButton } from "../win98/Window";
import { TitleBar } from "./TitleBar";

interface Props {
  images: ProjectImage[];
  /** index of the open image, or null when closed */
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

/** Full-screen image viewer styled like the Windows 98 media "PLAYER". ← → keys browse. */
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
      onClose={() => onIndexChange(null)}
      onKeyDown={(e) => {
        if (index === null) return;
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      className="win98 win-raised m-auto h-[calc(100dvh-2rem)] max-h-none w-[calc(100%-2rem)] max-w-6xl flex-col p-[3px] backdrop:bg-black/80 open:flex"
    >
      {image && index !== null && (
        <>
          <TitleBar
            title={`PLAYER - IMG_${String(n).padStart(4, "0")}.JPG`}
            icon={<PictureIcon size={14} />}
            onClose={() => onIndexChange(null)}
          />
          <div className="flex items-center gap-1 px-1 py-1">
            <ToolButton label="Previous" onClick={() => go(index - 1)} disabled={images.length < 2}>
              ←
            </ToolButton>
            <ToolButton label="Next" onClick={() => go(index + 1)} disabled={images.length < 2}>
              →
            </ToolButton>
            <span className="ml-2 truncate text-[12px]">{image.caption || "No caption"}</span>
          </div>
          <div className="win-sunken relative flex min-h-0 flex-1 items-center justify-center bg-black! p-2">
            <img
              src={mediaUrl(image.mediaId) ?? ""}
              alt={image.caption}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          {/* seek bar = position in the gallery */}
          <div className="flex items-center gap-2 px-2 pt-2">
            <input
              type="range"
              min={1}
              max={images.length}
              value={n}
              onChange={(e) => go(Number(e.target.value) - 1)}
              aria-label="Image position"
              className="flex-1 accent-[#000080]"
            />
            <span className="win-sunken px-2 py-0.5 font-mono text-[11px]">
              {String(n).padStart(2, "0")}/{String(images.length).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-1 px-1 py-1.5">
            <ToolButton label="First image" onClick={() => go(0)}>
              ⏮
            </ToolButton>
            <ToolButton label="Previous image" onClick={() => go(index - 1)}>
              ◀◀
            </ToolButton>
            <ToolButton label="Next image" onClick={() => go(index + 1)}>
              ▶▶
            </ToolButton>
            <ToolButton label="Last image" onClick={() => go(images.length - 1)}>
              ⏭
            </ToolButton>
            <ToolButton label="Stop" onClick={() => onIndexChange(null)}>
              ■
            </ToolButton>
            <span className="ml-auto text-[11px] text-[#404040]">← → to browse</span>
          </div>
        </>
      )}
    </dialog>
  );
}
