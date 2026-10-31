import { useId, useState } from "react";
import type { FormEvent } from "react";
import { ErrorLine, TextArea, TextField } from "../../components/ui/Field";
import { GalleryEditor } from "../../components/ui/GalleryEditor";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { cleanLinks, LinkListEditor } from "../../components/ui/LinkListEditor";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { TagInput } from "../../components/ui/TagInput";
import { api, errorMessage } from "../../lib/api";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type Project,
  type ProjectCategory,
  type ProjectInput,
  type ProjectStatus,
} from "../../lib/types";

interface Props {
  open: boolean;
  /** null = create a new project */
  project: Project | null;
  /** category pre-selected for a new project (e.g. the active filter) */
  defaultCategory?: ProjectCategory;
  onClose: () => void;
  onSaved: (project: Project) => void;
}

type TabId = "general" | "media" | "links" | "publish";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "media", label: "Images" },
  { id: "links", label: "Links" },
  { id: "publish", label: "Publish" },
];

const empty = (category: ProjectCategory): ProjectInput => ({
  title: "",
  summary: "",
  description: "",
  techStack: [],
  coverMediaId: null,
  featured: false,
  sortOrder: 0,
  category,
  role: "",
  year: String(new Date().getFullYear()),
  status: "completed",
  published: true,
  links: [],
  images: [],
});

export function ProjectEditor({ open, project, defaultCategory = "website", onClose, onSaved }: Props) {
  return (
    <Modal
      open={open}
      title={project ? `PROPERTIES: ${project.title}` : "NEW PROJECT WIZARD"}
      icon="▤"
      onClose={onClose}
      wide
    >
      {open && (
        <ProjectForm project={project} defaultCategory={defaultCategory} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  );
}

function ProjectForm({ project, defaultCategory = "website", onClose, onSaved }: Omit<Props, "open">) {
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
          category: project.category,
          role: project.role,
          year: project.year,
          status: project.status,
          published: project.published,
          links: project.links.map((l) => ({ ...l })),
          images: project.images.map((i) => ({ ...i })),
        }
      : empty(defaultCategory),
  );
  const [tab, setTab] = useState<TabId>("general");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const categoryId = useId();
  const statusId = useId();

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isDesign = form.category === "graphic_design";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Browser validation can't reach fields on hidden tabs, so check the required one here.
    if (!form.title.trim()) {
      setTab("general");
      setError("Title is required");
      return;
    }
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
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Tabs label="Project sections" tabs={TABS} value={tab} onChange={setTab} />

      {tab === "general" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={categoryId} className="label text-phosphor-dim">
                Type
              </label>
              <select
                id={categoryId}
                className="input"
                value={form.category}
                onChange={(e) => set("category", e.target.value as ProjectCategory)}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={statusId} className="label text-phosphor-dim">
                Status
              </label>
              <select
                id={statusId}
                className="input"
                value={form.status}
                onChange={(e) => set("status", e.target.value as ProjectStatus)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Your role"
              placeholder={isDesign ? "Designer, illustrator" : "Full-stack developer"}
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              maxLength={80}
            />
            <TextField
              label="Year"
              placeholder="2026"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              maxLength={20}
            />
          </div>
          <TextArea
            label="Full description"
            rows={8}
            placeholder={
              isDesign
                ? "The brief, your concept, process, tools and the final result..."
                : "What it does, why you built it, your role, challenges, results..."
            }
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={20000}
          />
          <TagInput
            label={isDesign ? "Tools used" : "Tech stack"}
            value={form.techStack}
            onChange={(v) => set("techStack", v)}
            placeholder={isDesign ? "Photoshop, Illustrator, Figma..." : "React, Express, Docker..."}
          />
        </div>
      )}

      {tab === "media" && (
        <div className="flex flex-col gap-6">
          <ImageUploader
            label="Cover image (shown on the card)"
            value={form.coverMediaId}
            onChange={(id) => set("coverMediaId", id)}
            aspect="aspect-video"
          />
          <GalleryEditor images={form.images} onChange={(images) => set("images", images)} />
        </div>
      )}

      {tab === "links" && (
        <LinkListEditor
          label="Project links (optional)"
          links={form.links}
          onChange={(links) => set("links", links)}
          labelPlaceholder={isDesign ? "Behance" : "Live demo"}
        />
      )}

      {tab === "publish" && (
        <div className="flex flex-col gap-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="mt-0.5 size-4 accent-phosphor"
            />
            <span>
              <span className="label block text-phosphor">Published</span>
              <span className="text-xs text-muted">
                Untick to keep it as a draft. Drafts are only visible to you.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="mt-0.5 size-4 accent-phosphor"
            />
            <span>
              <span className="label block text-phosphor">★ Featured</span>
              <span className="text-xs text-muted">Pinned to the top of the project list.</span>
            </span>
          </label>
          <TextField
            label="Order"
            type="number"
            hint="Lower numbers show first."
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
          />
        </div>
      )}

      <ErrorLine message={error} />
      <div className="flex justify-end gap-2 border-t border-phosphor-dim/40 pt-4">
        <button type="button" className="btn-lcd" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Saving..." : project ? "OK" : "Add project"}
        </button>
      </div>
    </form>
  );
}
