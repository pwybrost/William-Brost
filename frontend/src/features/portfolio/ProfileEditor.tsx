import { useState } from "react";
import type { FormEvent } from "react";
import { ErrorLine, TextArea, TextField } from "../../components/ui/Field";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { Modal } from "../../components/ui/Modal";
import { TagInput } from "../../components/ui/TagInput";
import { api, errorMessage } from "../../lib/api";
import type { Profile } from "../../lib/types";

interface Props {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}

export function ProfileEditor({ open, profile, onClose, onSaved }: Props) {
  return (
    <Modal open={open} title="EDIT PROFILE" onClose={onClose} wide>
      {/* Re-mount the form each time it opens so it starts from the saved data */}
      {open && <ProfileForm profile={profile} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function ProfileForm({ profile, onClose, onSaved }: Omit<Props, "open">) {
  const [form, setForm] = useState(() => ({ ...profile }));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
          placeholder="Computer Science student · Full-stack developer"
          value={form.headline}
          onChange={(e) => set("headline", e.target.value)}
          maxLength={140}
        />
        <TextField
          label="Location"
          placeholder="City, Country"
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
      </div>

      <TextField
        label="Resume / CV link"
        type="url"
        placeholder="https://drive.google.com/..."
        hint="Optional. A link to your PDF resume."
        value={form.resumeUrl}
        onChange={(e) => set("resumeUrl", e.target.value)}
      />

      <TextArea
        label="Bio"
        rows={7}
        placeholder="Tell visitors who you are, what you build and what you're looking for."
        value={form.bio}
        onChange={(e) => set("bio", e.target.value)}
        maxLength={5000}
      />

      <TagInput
        label="Skills"
        value={form.skills}
        onChange={(skills) => set("skills", skills)}
        placeholder="React, Node.js, PostgreSQL..."
      />

      <ErrorLine message={error} />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-lcd" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
