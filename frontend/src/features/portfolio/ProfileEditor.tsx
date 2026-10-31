import { useId, useState } from "react";
import type { FormEvent } from "react";
import { ErrorLine, TextArea, TextField } from "../../components/ui/Field";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { TagInput } from "../../components/ui/TagInput";
import { api, errorMessage } from "../../lib/api";
import type { Profile } from "../../lib/types";

export type ProfileTab = "identity" | "photos" | "about";

interface Props {
  open: boolean;
  profile: Profile;
  /** which tab to open on (e.g. "about" when editing the bio) */
  initialTab?: ProfileTab;
  onClose: () => void;
  onSaved: () => void;
}

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "photos", label: "Photos" },
  { id: "about", label: "About & skills" },
];

const AVAILABILITY_SUGGESTIONS = [
  "Open to internships",
  "Open to freelance work",
  "Open to full-time roles",
  "Currently busy",
];

export function ProfileEditor({ open, profile, initialTab = "identity", onClose, onSaved }: Props) {
  return (
    <Modal open={open} title="PROFILE PROPERTIES" icon="☺" onClose={onClose} wide>
      {/* Re-mount the form each time it opens so it starts from the saved data */}
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

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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
        <div className="flex flex-col gap-4">
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
              label="Availability badge"
              placeholder="Open to internships"
              hint="Shown next to your name with a green light. Leave empty to hide."
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
            <TextField
              label="Contact email (public)"
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
            <TextField
              label="Resume / CV link"
              type="url"
              placeholder="https://drive.google.com/..."
              hint="Optional. A link to your PDF resume."
              value={form.resumeUrl}
              onChange={(e) => set("resumeUrl", e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === "photos" && (
        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <ImageUploader
            label="Profile picture"
            value={form.avatarMediaId}
            onChange={(id) => set("avatarMediaId", id)}
            aspect="aspect-square"
          />
          <ImageUploader
            label="Cover photo"
            value={form.coverMediaId}
            onChange={(id) => set("coverMediaId", id)}
            aspect="aspect-[3/1]"
          />
        </div>
      )}

      {tab === "about" && (
        <div className="flex flex-col gap-5">
          <TextArea
            label="Bio"
            rows={9}
            placeholder="Tell visitors who you are, what you build and design, and what you're looking for."
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            maxLength={5000}
          />
          <TagInput
            label="Skills"
            value={form.skills}
            onChange={(skills) => set("skills", skills)}
            placeholder="React, Node.js, Photoshop, Figma..."
          />
        </div>
      )}

      <ErrorLine message={error} />
      <div className="flex justify-end gap-2 border-t border-phosphor-dim/40 pt-4">
        <button type="button" className="btn-lcd" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Saving..." : "OK"}
        </button>
      </div>
    </form>
  );
}
