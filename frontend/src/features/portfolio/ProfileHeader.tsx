import { DateStamp, EditButton } from "../../components/ui/Misc";
import { mediaUrl } from "../../lib/api";
import type { Link, Profile } from "../../lib/types";

interface Props {
  profile: Profile;
  socialLinks: Link[];
  editing: boolean;
  onEditProfile: () => void;
  onEditLinks: () => void;
}

export function ProfileHeader({ profile, socialLinks, editing, onEditProfile, onEditLinks }: Props) {
  const cover = mediaUrl(profile.coverMediaId);
  const avatar = mediaUrl(profile.avatarMediaId);
  const initials = profile.fullName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="bevel p-1">
      {/* Cover photo, shown like the camera's playback screen */}
      <div className="lcd scanlines bevel-inset relative aspect-[3/1] min-h-40 overflow-hidden">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_40%,#1f3a26,transparent_60%),radial-gradient(circle_at_75%_70%,#3a2a12,transparent_55%)]">
            <span className="label text-phosphor-dim">NO COVER PHOTO</span>
          </div>
        )}
        <span className="label absolute top-3 left-3 z-[2] text-silver-light drop-shadow">▶ PLAY 100-0001</span>
        <DateStamp className="absolute right-3 bottom-2 z-[2]" />
        {editing && (
          <div className="absolute top-3 right-3 z-[3]">
            <EditButton onClick={onEditProfile}>✎ Edit profile</EditButton>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 bg-body px-5 pt-0 pb-5 sm:flex-row sm:items-end">
        <div className="viewfinder bevel-inset relative -mt-14 size-32 shrink-0 overflow-hidden bg-black sm:size-36 [--vf-size:14px]">
          {avatar ? (
            <img src={avatar} alt={profile.fullName} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-display text-5xl text-phosphor glow">
              {initials || "WB"}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 pt-4">
          <h1 className="font-display text-5xl leading-none text-silver-light sm:text-6xl">
            {profile.fullName}
          </h1>
          {profile.headline && <p className="text-sm text-phosphor">{profile.headline}</p>}
          {profile.availability && (
            <span className="label mt-1 inline-flex items-center gap-2 self-start border border-phosphor/70 bg-lcd px-2 py-1 text-phosphor">
              <span className="size-2 animate-blink rounded-full bg-phosphor shadow-[0_0_8px_#8dff6a]" aria-hidden />
              {profile.availability}
            </span>
          )}
          <p className="label mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted">
            {profile.location && <span>⌖ {profile.location}</span>}
            {profile.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="hover:text-phosphor">
                ✉ {profile.contactEmail}
              </a>
            )}
          </p>
        </div>

        {profile.resumeUrl && (
          <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn self-start sm:self-end">
            ⇩ Resume
          </a>
        )}
      </div>

      {(socialLinks.length > 0 || editing) && (
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-black bg-body px-5 py-3">
          {socialLinks.map((l) => (
            <a
              key={l.id ?? l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lcd px-3 py-1.5 text-[10px]"
            >
              {l.label} ↗
            </a>
          ))}
          {editing && <EditButton onClick={onEditLinks}>✎ Edit links</EditButton>}
        </div>
      )}
    </section>
  );
}
