import { useId, useState } from "react";
import type { FormEvent } from "react";
import { DialogButtons, ErrorLine, TextArea, TextField } from "../../components/ui/Field";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { TagInput } from "../../components/ui/TagInput";
import { ComputerIcon, PdfIcon } from "../../components/win98/Icons";
import { SavingProgress } from "../../components/win98/ProgressBar";
import { PDF_TYPE, useUpload } from "../../hooks/useUpload";
import { api, errorMessage, mediaUrl } from "../../lib/api";
import type { Profile } from "../../lib/types";

export type ProfileTab = "identity" | "photos" | "about" | "skills" | "resume";

interface Props {
  open: boolean;
  profile: Profile;
  /** which tab to open on */
  initialTab?: ProfileTab;
  onClose: () => void;
  onSaved: () => void;
}

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "photos", label: "Photos" },
  { id: "about", label: "Bio" },
  { id: "skills", label: "Skills" },
  { id: "resume", label: "Resume" },
];

const AVAILABILITY_SUGGESTIONS = [
  "Open to internships",
  "Open to freelance work",
  "Open to full-time roles",
  "Currently busy",
];

/** Everything about the owner: name, photos, bio, skills, resume (owner only). */
export function ProfileEditor({ open, profile, initialTab = "identity", onClose, onSaved }: Props) {
  return (
    <Modal open={open} title="Profile Properties" icon={<ComputerIcon size={18} />} onClose={onClose} wide>
      {open && <ProfileForm profile={profile} initialTab={initialTab} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function ProfileForm({ profile, initialTab = "identity", onClose, onSaved }: Omit<Props, "open">) {
  const [form, setForm] = useState(() => ({ ...profile }));
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const suggestionsId = useId();

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setForm((f) => ({ ...f, [key]: value }));
  const resumeUpload = useUpload((id) => set("resumeMediaId", id), PDF_TYPE);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setTab("identity");
      setError("Name is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.updateProfile(form); // the API ignores read-only fields like updatedAt
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Tabs label="Profile sections" tabs={TABS} value={tab} onChange={setTab} />

      {tab === "identity" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Full name"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            required
            maxLength={80}
          />
          <TextField
            label="Headline"
            placeholder="CS student · Developer · Graphic designer"
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            maxLength={140}
          />
          <TextField
            label="Availability"
            placeholder="Open to internships"
            hint="Shown with a green light. Leave empty to hide."
            list={suggestionsId}
            value={form.availability}
            onChange={(e) => set("availability", e.target.value)}
            maxLength={60}
          />
          <datalist id={suggestionsId}>
            {AVAILABILITY_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <TextField
            label="Location"
            placeholder="Davao City, Philippines"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={80}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Public contact email"
              type="email"
              hint="Shown on the Contact window. Messages from the contact form go to your Inbox either way."
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === "photos" && (
        <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
          <ImageUploader
            label="Profile picture"
            value={form.avatarMediaId}
            onChange={(id) => set("avatarMediaId", id)}
            aspect="aspect-[4/5]"
          />
          <ImageUploader
            label="Cover banner (optional, top of Home)"
            value={form.coverMediaId}
            onChange={(id) => set("coverMediaId", id)}
            aspect="aspect-[3/1]"
          />
        </div>
      )}

      {tab === "about" && (
        <TextArea
          label="Bio"
          rows={12}
          hint="Shown next to your photo on Home. Leave a blank line between paragraphs."
          placeholder="Who you are, what you build and design, and what you're looking for."
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          maxLength={5000}
        />
      )}

      {tab === "skills" && (
        <TagInput
          label="Skills"
          value={form.skills}
          onChange={(skills) => set("skills", skills)}
          placeholder="Frontend: React, Design: Figma..."
          hint='Press Enter or comma to add. Write "Group: Skill" (e.g. "Frontend: React") to group skills on the Stack window.'
        />
      )}

      {tab === "resume" && (
        <div className="flex flex-col gap-5">
          <fieldset className="win-group flex flex-col gap-3">
            <legend>Resume PDF</legend>
            {form.resumeMediaId ? (
              <div className="flex flex-wrap items-center gap-3">
                <PdfIcon />
                <a
                  href={mediaUrl(form.resumeMediaId) ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link underline"
                >
                  Current resume (PDF)
                </a>
                <button type="button" className="win-button" onClick={resumeUpload.open} disabled={resumeUpload.busy}>
                  Replace...
                </button>
                <button type="button" className="win-button" onClick={() => set("resumeMediaId", null)}>
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="win-button self-start"
                onClick={resumeUpload.open}
                disabled={resumeUpload.busy}
              >
                Upload PDF...
              </button>
            )}
            {resumeUpload.busy && <SavingProgress percent={resumeUpload.progress} label="Uploading resume" />}
            {resumeUpload.error && (
              <p role="alert" className="text-[13px] text-danger">
                {resumeUpload.error}
              </p>
            )}
            <input
              ref={resumeUpload.inputRef}
              type="file"
              accept={resumeUpload.accept}
              className="hidden"
              onChange={(e) => void resumeUpload.upload(e.target.files?.[0])}
            />
            <p className="text-[13px] text-muted">
              PDF up to {resumeUpload.maxMb} MB. Visitors can open or download it.
            </p>
          </fieldset>
          <TextField
            label="Or link to a resume"
            type="url"
            placeholder="https://drive.google.com/..."
            hint="Used when no PDF is uploaded."
            value={form.resumeUrl}
            onChange={(e) => set("resumeUrl", e.target.value)}
          />
        </div>
      )}

      <ErrorLine message={error} />
      <DialogButtons busy={busy} onCancel={onClose} />
    </form>
  );
}
