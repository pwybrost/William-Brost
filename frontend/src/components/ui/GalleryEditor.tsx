import { useRef, useState } from "react";
import { api, errorMessage, mediaUrl } from "../../lib/api";
import type { ProjectImage } from "../../lib/types";
import { SavingProgress } from "../win98/ProgressBar";

const MAX_MB = 5;
const MAX_IMAGES = 40;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface Props {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
}

/** Upload several images at once, add captions, reorder and remove them. */
export function GalleryEditor({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const onFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    const added: ProjectImage[] = [];
    const errs: string[] = [];

    for (const [i, file] of files.entries()) {
      setBusy(`Saving ${i + 1} of ${files.length}`);
      setProgress(0);
      if (file.size > MAX_MB * 1024 * 1024) {
        errs.push(`${file.name}: larger than ${MAX_MB} MB`);
        continue;
      }
      try {
        const { id } = await api.uploadImage(file, setProgress);
        added.push({ mediaId: id, caption: "" });
      } catch (err) {
        errs.push(`${file.name}: ${errorMessage(err)}`);
      }
    }

    onChange([...images, ...added]);
    setErrors(errs);
    setBusy(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const update = (i: number, caption: string) =>
    onChange(images.map((img, idx) => (idx === i ? { ...img, caption } : img)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="label text-phosphor-dim">
          Gallery ({images.length}/{MAX_IMAGES})
        </span>
        <button
          type="button"
          className="btn-lcd"
          disabled={Boolean(busy) || images.length >= MAX_IMAGES}
          onClick={() => inputRef.current?.click()}
        >
          + Add images...
        </button>
      </div>
      <p className="text-xs text-muted">
        Screenshots, design boards, posters, mockups. You can select several files at once. The first image shows first
        in the gallery.
      </p>

      {busy && <SavingProgress percent={progress} label={busy} />}

      {images.length === 0 ? (
        <div className="bevel-inset flex h-28 items-center justify-center bg-black">
          <span className="label text-[#c0c0c0]">No images</span>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {images.map((img, i) => (
            <li key={img.mediaId} className="bevel-inset flex gap-3 bg-black/40 p-2">
              <img src={mediaUrl(img.mediaId) ?? ""} alt="" className="size-20 shrink-0 bg-black object-cover" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  className="input py-1 text-xs"
                  placeholder="Caption (optional)"
                  value={img.caption}
                  maxLength={200}
                  onChange={(e) => update(i, e.target.value)}
                  aria-label={`Caption for image ${i + 1}`}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="btn-lcd px-2 py-1"
                    onClick={() => move(i, -1)}
                    aria-label="Move earlier"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    className="btn-lcd px-2 py-1"
                    onClick={() => move(i, 1)}
                    aria-label="Move later"
                  >
                    ▶
                  </button>
                  <button
                    type="button"
                    className="btn-lcd px-2 py-1 text-rec"
                    onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                    aria-label="Remove image"
                  >
                    DEL
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {errors.map((e) => (
        <p key={e} className="text-xs text-rec">
          ! {e}
        </p>
      ))}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => void onFiles(e.target.files)}
      />
    </div>
  );
}
