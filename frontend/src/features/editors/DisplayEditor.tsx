import { useState } from "react";
import { DialogButtons, ErrorLine } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { ComputerIcon } from "../../components/win98/Icons";
import { SavingProgress } from "../../components/win98/ProgressBar";
import { useTheme, type ThemeMode } from "../../context/ThemeContext";
import { useUpload } from "../../hooks/useUpload";
import { api, errorMessage, mediaUrl } from "../../lib/api";
import type { Profile } from "../../lib/types";

interface Props {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}

const THEMES: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "Match device" },
];

/**
 * "Display Properties": wallpaper for everyone (saved on the server) and the
 * light/dark theme for this browser.
 */
export function DisplayEditor({ open, profile, onClose, onSaved }: Props) {
  return (
    <Modal open={open} title="Display Properties" icon={<ComputerIcon size={18} />} onClose={onClose} wide>
      {open && <DisplayForm profile={profile} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function DisplayForm({ profile, onClose, onSaved }: Omit<Props, "open">) {
  const theme = useTheme();
  const [wallpaper, setWallpaper] = useState(profile.wallpaperMediaId);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const up = useUpload((id) => setWallpaper(id));
  const src = mediaUrl(wallpaper);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.updateProfile({ ...profile, wallpaperMediaId: wallpaper });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="flex flex-col gap-6"
    >
      {/* monitor preview */}
      <div className="mx-auto flex w-full max-w-sm flex-col items-center">
        <div className="win-raised w-full p-3">
          <div className="win-sunken aspect-[4/3] overflow-hidden p-[2px]">
            {src ? (
              <img src={src} alt="Wallpaper preview" className="h-full w-full object-cover" />
            ) : (
              <div className="wallpaper h-full w-full" />
            )}
          </div>
        </div>
        <div className="win-raised h-4 w-20" />
        <div className="win-raised h-3 w-40" />
      </div>

      <fieldset className="win-group flex flex-col gap-3">
        <legend>Wallpaper (everyone sees this)</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="win-button" onClick={() => setWallpaper(null)} aria-pressed={!wallpaper}>
            Green hills (default)
          </button>
          <button type="button" className="win-button" onClick={up.open} disabled={up.busy}>
            Browse for a picture...
          </button>
        </div>
        {up.busy && <SavingProgress percent={up.progress} />}
        {up.error && (
          <p role="alert" className="text-[13px] text-danger">
            {up.error}
          </p>
        )}
        <input
          ref={up.inputRef}
          type="file"
          accept={up.accept}
          className="hidden"
          onChange={(e) => void up.upload(e.target.files?.[0])}
        />
        <p className="text-[13px] text-muted">
          A wide landscape photo works best (at least 1920×1080). It's dimmed slightly in dark mode.
        </p>
      </fieldset>

      <fieldset className="win-group">
        <legend>Appearance (this browser only)</legend>
        <div role="radiogroup" className="flex flex-wrap gap-4">
          {THEMES.map((t) => (
            <label key={t.mode} className="flex cursor-pointer items-center gap-2 text-[15px]">
              <input
                type="radio"
                name="theme"
                checked={theme.mode === t.mode}
                onChange={() => theme.setMode(t.mode)}
                className="size-4 accent-[var(--wb-accent)]"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <ErrorLine message={error} />
      <DialogButtons busy={busy} onCancel={onClose} />
    </form>
  );
}
