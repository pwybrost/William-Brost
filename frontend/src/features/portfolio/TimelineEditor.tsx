import { useState } from "react";
import type { FormEvent } from "react";
import { ErrorLine, TextArea, TextField } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { api, errorMessage } from "../../lib/api";
import type { TimelineEntry, TimelineInput, TimelineKind } from "../../lib/types";

interface Props {
  open: boolean;
  kind: TimelineKind;
  /** null = create a new entry */
  entry: TimelineEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

const COPY = {
  experience: { title: "Role / position", org: "Company / organization", noun: "EXPERIENCE" },
  education: { title: "Degree / program", org: "School", noun: "EDUCATION" },
};

export function TimelineEditor({ open, kind, entry, onClose, onSaved }: Props) {
  return (
    <Modal open={open} title={`${entry ? "EDIT" : "ADD"} ${COPY[kind].noun}`} onClose={onClose}>
      {open && <EntryForm kind={kind} entry={entry} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function EntryForm({ kind, entry, onClose, onSaved }: Omit<Props, "open">) {
  const [form, setForm] = useState<TimelineInput>(() =>
    entry
      ? { ...entry }
      : {
          kind,
          title: "",
          organization: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          sortOrder: 0,
        },
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof TimelineInput>(key: K, value: TimelineInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: TimelineInput = {
        kind: form.kind,
        title: form.title,
        organization: form.organization,
        location: form.location,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
        sortOrder: form.sortOrder,
      };
      if (entry) await api.updateTimeline(entry.id, payload);
      else await api.createTimeline(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = COPY[kind];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextField label={copy.title} value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={120} />
      <TextField label={copy.org} value={form.organization} onChange={(e) => set("organization", e.target.value)} maxLength={120} />
      <TextField label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={80} />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Start" placeholder="Jun 2025" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} maxLength={30} />
        <TextField label="End" placeholder="Present" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} maxLength={30} />
      </div>
      <TextArea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={5000} />
      <TextField
        label="Order"
        type="number"
        hint="Lower numbers show first."
        value={form.sortOrder}
        onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
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
