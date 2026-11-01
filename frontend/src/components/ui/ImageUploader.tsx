import { useUpload } from "../../hooks/useUpload";
import { mediaUrl } from "../../lib/api";
import { PictureIcon } from "../win98/Icons";
import { SavingProgress } from "../win98/ProgressBar";

interface ImageUploaderProps {
  label: string;
  value: string | null; // media id
  onChange: (id: string | null) => void;
  /** tailwind aspect class for the preview, e.g. "aspect-square" */
  aspect?: string;
}

/** Image field with preview, Browse/Remove buttons and an upload progress bar. */
export function ImageUploader({ label, value, onChange, aspect = "aspect-video" }: ImageUploaderProps) {
  const up = useUpload((id) => onChange(id));
  const src = mediaUrl(value);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[14px] font-semibold">{label}</span>
      <div className={`win-sunken relative flex ${aspect} w-full items-center justify-center overflow-hidden p-[2px]`}>
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <PictureIcon size={40} />}
        {up.busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-3">
            <SavingProgress percent={up.progress} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="win-button" disabled={up.busy} onClick={up.open}>
          {src ? "Change..." : "Browse..."}
        </button>
        {src && (
          <button type="button" className="win-button" disabled={up.busy} onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={up.inputRef}
        type="file"
        accept={up.accept}
        className="hidden"
        onChange={(e) => void up.upload(e.target.files?.[0])}
      />
      <p className="text-[13px] text-muted">JPEG, PNG, WebP or GIF, up to {up.maxMb} MB.</p>
      {up.error && (
        <p role="alert" className="text-[13px] text-danger">
          {up.error}
        </p>
      )}
    </div>
  );
}
