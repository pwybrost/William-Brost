import { useRef, useState } from "react";
import { api, errorMessage, mediaUrl } from "../../lib/api";

const MAX_MB = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface ImageUploaderProps {
  label: string;
  value: string | null; // media id
  onChange: (id: string | null) => void;
  /** tailwind aspect class for the preview, e.g. "aspect-square" */
  aspect?: string;
}

export function ImageUploader({ label, value, onChange, aspect = "aspect-video" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = mediaUrl(value);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB} MB`);
      return;
    }
    setBusy(true);
    try {
      const { id } = await api.uploadImage(file);
      onChange(id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="label text-phosphor-dim">{label}</span>
      <div className={`viewfinder bevel-inset relative flex ${aspect} w-full items-center justify-center overflow-hidden bg-black`}>
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="label text-phosphor-dim">NO IMAGE</span>
        )}
        {busy && (
          <span className="label absolute inset-0 flex items-center justify-center bg-black/70 text-phosphor">
            <span className="animate-blink">SAVING TO CARD...</span>
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-lcd" disabled={busy} onClick={() => inputRef.current?.click()}>
          {src ? "Change" : "Upload"}
        </button>
        {src && (
          <button type="button" className="btn-lcd text-rec" disabled={busy} onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <p className="text-xs text-muted">JPEG, PNG, WebP or GIF, up to {MAX_MB} MB.</p>
      {error && <p className="text-xs text-rec">! {error}</p>}
    </div>
  );
}
