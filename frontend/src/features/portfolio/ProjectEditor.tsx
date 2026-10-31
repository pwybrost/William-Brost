import { useState } from "react";
import type { FormEvent } from "react";
import { ErrorLine, TextArea, TextField } from "../../components/ui/Field";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { cleanLinks, LinkListEditor } from "../../components/ui/LinkListEditor";
import { Modal } from "../../components/ui/Modal";
import { TagInput } from "../../components/ui/TagInput";
import { api, errorMessage } from "../../lib/api";
import type { Project, ProjectInput } from "../../lib/types";

interface Props {
  open: boolean;
  /** null = create a new project */
  project: Project | null;
  onClose: () => void;
  onSaved: (project: Project) => void;
}

const EMPTY: ProjectInput = {
  title: "",
  summary: "",
  description: "",
  techStack: [],
  coverMediaId: null,
  featured: false,
  sortOrder: 0,
  links: [],
};

export function ProjectEditor({ open, project, onClose, onSaved }: Props) {
  return (
    <Modal open={open} title={project ? "EDIT PROJECT" : "NEW PROJECT"} onClose={onClose} wide>
      {open && <ProjectForm project={project} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function ProjectForm({ project, onClose, onSaved }: Omit<Props, "open">) {
  const [form, setForm] = useState<ProjectInput>(() =>
    project
      ? {
          title: project.title,
          summary: project.summary,
          description: project.description,
          techStack: project.techStack,
          coverMediaId: project.coverMediaId,
          featured: project.featured,
          sortOrder: project.sortOrder,
          links: project.links.map((l) => ({ ...l })),
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { ...form, links: cleanLinks(form.links) };
      const { project: saved } = project
        ? await api.updateProject(project.id, payload)
        : await api.createProject(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <ImageUploader
        label="Cover image"
        value={form.coverMediaId}
        onChange={(id) => set("coverMediaId", id)}
        aspect="aspect-video"
      />

      <TextField
        label="Title"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        required
        maxLength={120}
      />
      <TextField
        label="Short summary"
        hint="One or two lines shown on the project card."
        value={form.summary}
        onChange={(e) => set("summary", e.target.value)}
        maxLength={280}
      />
      <TextArea
        label="Full description"
        rows={8}
        placeholder="What it does, why you built it, your role, challenges, results..."
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        maxLength={20000}
      />
      <TagInput
        label="Tech stack"
        value={form.techStack}
        onChange={(v) => set("techStack", v)}
        placeholder="React, Express, Docker..."
      />

      <LinkListEditor
        label="Project links (optional)"
        links={form.links}
        onChange={(links) => set("links", links)}
        labelPlaceholder="Live demo"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Order"
          type="number"
          hint="Lower numbers show first."
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
        />
        <label className="flex cursor-pointer items-center gap-3 self-center">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="size-4 accent-phosphor"
          />
          <span className="label text-phosphor">★ Featured (pinned to the top)</span>
        </label>
      </div>

      <ErrorLine message={error} />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-lcd" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Saving..." : project ? "Save" : "Add project"}
        </button>
      </div>
    </form>
  );
}
