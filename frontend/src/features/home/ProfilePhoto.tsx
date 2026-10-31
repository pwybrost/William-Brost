import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { OwnerButton } from "../../components/ui/OwnerButton";
import { TitleBar } from "../../components/ui/TitleBar";
import { PictureIcon } from "../../components/win98/Icons";
import { SavingProgress } from "../../components/win98/ProgressBar";
import { useUpload } from "../../hooks/useUpload";
import { mediaUrl } from "../../lib/api";

interface Props {
  name: string;
  mediaId: string | null;
  editing: boolean;
  onChange: (mediaId: string | null) => Promise<void>;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The profile picture in its own little "me.jpg" window.
 * - On load it appears line by line in black and white, then turns to colour,
 *   like a photo downloading over a dial-up modem.
 * - On hover it tilts toward the pointer and a light glare sweeps across.
 * Both are switched off for visitors who prefer reduced motion.
 */
export function ProfilePhoto({ name, mediaId, editing, onChange }: Props) {
  const src = mediaUrl(mediaId);
  const frameRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const up = useUpload((id) => onChange(id));
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el || e.pointerType !== "mouse" || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <figure className="flex flex-col items-center gap-3 [perspective:900px]">
      <div
        ref={frameRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group win-raised w-full max-w-sm p-[3px] shadow-[var(--wb-shadow)] transition-transform duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:scale-[1.02]"
      >
        <TitleBar as="div" title="me.jpg" icon={<PictureIcon size={16} />} />
        <div className="win-sunken relative mt-[3px] aspect-[4/5] overflow-hidden p-[2px]">
          {src ? (
            <img
              src={src}
              alt={`Photo of ${name}`}
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover ${loaded ? "animate-dialup" : "opacity-0"}`}
            />
          ) : (
            <span className="flex h-full items-center justify-center bg-accent text-6xl font-bold text-accent-fg">
              {initials || "WB"}
            </span>
          )}
          {/* glare that follows the pointer */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(115deg, transparent calc(var(--gx, 50%) - 25%), rgb(255 255 255 / 0.28) var(--gx, 50%), transparent calc(var(--gx, 50%) + 25%))",
            }}
          />
          {up.busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-4">
              <SavingProgress percent={up.progress} label="Saving photo" />
            </div>
          )}
        </div>
      </div>

      {editing && (
        <figcaption className="flex flex-wrap justify-center gap-2">
          <OwnerButton onClick={up.open} disabled={up.busy}>
            {src ? "Change photo..." : "Add photo..."}
          </OwnerButton>
          {src && (
            <OwnerButton onClick={() => void onChange(null)} disabled={up.busy}>
              Remove
            </OwnerButton>
          )}
          {up.error && (
            <span role="alert" className="w-full text-center text-[13px] text-danger">
              {up.error}
            </span>
          )}
        </figcaption>
      )}
      <input
        ref={up.inputRef}
        type="file"
        accept={up.accept}
        className="hidden"
        onChange={(e) => void up.upload(e.target.files?.[0])}
      />
    </figure>
  );
}
