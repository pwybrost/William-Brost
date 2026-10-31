import { useRef, useState } from "react";
import { AddressBar, Window } from "../../components/win98/Window";
import { ComputerIcon, GlobeIcon, MailIcon, NotepadIcon } from "../../components/win98/Icons";
import { SavingProgress } from "../../components/win98/ProgressBar";
import { useSystemDialog } from "../../components/win98/SystemDialog";
import { api, errorMessage, mediaUrl } from "../../lib/api";
import type { Link, Profile } from "../../lib/types";

const MAX_MB = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface Props {
  id?: string;
  profile: Profile;
  socialLinks: Link[];
  projectCount: number;
  editing: boolean;
  onEditProfile: () => void;
  onEditLinks: () => void;
  /** saves one or two profile fields right away (used by the quick photo buttons) */
  onQuickSave: (patch: Partial<Profile>) => Promise<void>;
}

/**
 * Picks an image, uploads it with a progress bar, then calls onDone with the new media id.
 * Returns the button props and the overlay to render while it uploads.
 */
function useQuickUpload(onDone: (id: string | null) => Promise<void>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const dialogs = useSystemDialog();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      await dialogs.error({ message: `That image is larger than ${MAX_MB} MB.` });
      return;
    }
    setProgress(0);
    try {
      const { id } = await api.uploadImage(file, setProgress);
      await onDone(id);
    } catch (err) {
      await dialogs.error({ message: errorMessage(err) });
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT}
      className="hidden"
      onChange={(e) => void onFile(e.target.files?.[0])}
    />
  );
  return { input, open: () => inputRef.current?.click(), progress, busy: progress !== null };
}

export function ProfileHeader({
  id,
  profile,
  socialLinks,
  projectCount,
  editing,
  onEditProfile,
  onEditLinks,
  onQuickSave,
}: Props) {
  const dialogs = useSystemDialog();
  const cover = mediaUrl(profile.coverMediaId);
  const avatar = mediaUrl(profile.avatarMediaId);
  const initials = profile.fullName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const coverUpload = useQuickUpload((mediaId) => onQuickSave({ coverMediaId: mediaId }));
  const avatarUpload = useQuickUpload((mediaId) => onQuickSave({ avatarMediaId: mediaId }));

  const removeImage = async (field: "coverMediaId" | "avatarMediaId", what: string) => {
    if (!(await dialogs.confirm({ message: `Remove your ${what}?` }))) return;
    try {
      await onQuickSave({ [field]: null });
    } catch (err) {
      await dialogs.error({ message: errorMessage(err) });
    }
  };

  const menu = editing
    ? [
        { label: "Edit profile...", onClick: onEditProfile },
        { label: "Links...", onClick: onEditLinks },
        { label: "Change picture...", onClick: avatarUpload.open },
        { label: "Change cover...", onClick: coverUpload.open },
      ]
    : [{ label: "File" }, { label: "View" }, { label: "Help" }];

  return (
    <Window
      id={id}
      title={`User - ${profile.fullName}`}
      icon={<ComputerIcon size={14} />}
      menu={menu}
      toolbar={
        <>
          <AddressBar>
            <ComputerIcon size={14} />
            <span className="truncate">C:\Users\{profile.fullName}\</span>
          </AddressBar>
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="win-button">
              <NotepadIcon size={16} />
              Resume
            </a>
          )}
          <a href="#contact" className="win-button">
            <MailIcon size={16} />
            Contact
          </a>
        </>
      }
      body="face"
      status={[`${projectCount} project(s)`, `Updated ${new Date(profile.updatedAt).toLocaleDateString()}`]}
    >
      {/* Cover photo in a sunken black frame, like the media player screen */}
      <div className="win-sunken relative aspect-[3/1] min-h-36 overflow-hidden bg-black! p-[2px]">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#000080,#1084d0)]">
            <span className="text-[12px] text-white">{editing ? "No cover photo yet" : ""}</span>
          </div>
        )}
        {coverUpload.busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-3">
            <div className="w-64">
              <SavingProgress percent={coverUpload.progress} label="Saving cover" />
            </div>
          </div>
        )}
        {editing && !coverUpload.busy && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button type="button" className="win-button" onClick={coverUpload.open}>
              {cover ? "Change cover..." : "Add cover photo..."}
            </button>
            {cover && (
              <button
                type="button"
                className="win-button"
                onClick={() => void removeImage("coverMediaId", "cover photo")}
              >
                Remove
              </button>
            )}
          </div>
        )}
        {coverUpload.input}
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-end">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="win-raised relative -mt-12 p-[3px] sm:-mt-16">
            <div className="win-sunken relative size-28 overflow-hidden bg-black! p-[2px] sm:size-36">
              {avatar ? (
                <img src={avatar} alt={profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center bg-[#000080] text-4xl font-bold text-white">
                  {initials || "WB"}
                </span>
              )}
              {avatarUpload.busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] text-white">
                  {Math.round(avatarUpload.progress ?? 0)}%
                </div>
              )}
            </div>
          </div>
          {editing && (
            <div className="flex gap-1">
              <button
                type="button"
                className="win-button px-2 text-[11px]"
                disabled={avatarUpload.busy}
                onClick={avatarUpload.open}
              >
                {avatar ? "Change picture..." : "Add picture..."}
              </button>
              {avatar && (
                <button
                  type="button"
                  className="win-button px-2 text-[11px]"
                  disabled={avatarUpload.busy}
                  onClick={() => void removeImage("avatarMediaId", "profile picture")}
                  aria-label="Remove profile picture"
                >
                  ×
                </button>
              )}
            </div>
          )}
          {avatarUpload.input}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 pt-3">
          <h1 className="text-3xl font-bold sm:text-4xl">{profile.fullName}</h1>
          {profile.headline && <p className="text-[13px]">{profile.headline}</p>}
          {profile.availability && (
            <span className="win-sunken mt-1 inline-flex items-center gap-2 self-start px-2 py-0.5 text-[12px]">
              <span className="size-2.5 animate-blink rounded-full bg-[#2fa83a]" aria-hidden />
              {profile.availability}
            </span>
          )}
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#404040]">
            {profile.location && <span>⌖ {profile.location}</span>}
            {profile.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="text-[#000080] underline">
                {profile.contactEmail}
              </a>
            )}
          </p>
          {editing && (
            <div className="mt-2">
              <button type="button" className="win-button" onClick={onEditProfile}>
                Edit name, headline, bio...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account links as desktop shortcuts */}
      {(socialLinks.length > 0 || editing) && (
        <div className="mx-[2px] mb-[2px] flex flex-wrap gap-1 border-t border-[#808080] px-3 pt-3 pb-2 shadow-[inset_0_1px_#fff]">
          {socialLinks.map((l) => (
            <a
              key={l.id ?? l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-20 flex-col items-center gap-1 p-1 text-center text-[11px] focus:outline-none"
            >
              <GlobeIcon />
              <span className="line-clamp-2 px-0.5 group-hover:bg-[#000080] group-hover:text-white group-focus:bg-[#000080] group-focus:text-white">
                {l.label}
              </span>
            </a>
          ))}
          {editing && (
            <button
              type="button"
              onClick={onEditLinks}
              className="group flex w-20 cursor-pointer flex-col items-center gap-1 p-1 text-center text-[11px]"
            >
              <span className="flex size-8 items-center justify-center border border-dashed border-black text-xl">
                +
              </span>
              <span className="px-0.5 group-hover:bg-[#000080] group-hover:text-white">
                {socialLinks.length ? "Edit links" : "Add links"}
              </span>
            </button>
          )}
        </div>
      )}
    </Window>
  );
}
