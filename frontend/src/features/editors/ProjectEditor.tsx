import { useState } from "react";
import type { FormEvent } from "react";
import { CheckboxField, DialogButtons, ErrorLine, SelectField, TextArea, TextField } from "../../components/ui/Field";
import { GalleryEditor } from "../../components/ui/GalleryEditor";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { cleanLinks, LinkListEditor } from "../../components/ui/LinkListEditor";
import { Modal } from "../../components/ui/Modal";
import { Tabs } from "../../components/ui/Tabs";
import { TagInput } from "../../components/ui/TagInput";
import { FolderIcon } from "../../components/win98/Icons";
import { api, errorMessage } from "../../lib/api";
import { CATEGORY_LABELS, STATUS_LABELS, type Project, type ProjectCategory, type ProjectInput } from "../../lib/types";

interface Props {
  open: boolean;
  /** null = create a new project */
  project: Project | null;
  defaultCategory?: ProjectCategory;
  onClose: () => void;
  onSaved: (project: Project) => void;
}

type TabId = "general" | "case" | "media" | "links" | "publish";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "case", label: "Case study" },
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
  problem: "",
  process: "",
  outcome: "",
  links: [],
  images: [],
});

const fromProject = (p: Project): ProjectInput => ({
  title: p.title,
  summary: p.summary,
  description: p.description,
  techStack: p.techStack,
  coverMediaId: p.coverMediaId,
  featured: p.featured,
  sortOrder: p.sortOrder,
  category: p.category,
  role: p.role,
  year: p.year,
  status: p.status,
  published: p.published,
  problem: p.problem ?? "",
  process: p.process ?? "",
  outcome: p.outcome ?? "",
  links: p.links.map((l) => ({ ...l })),
  images: p.images.map((i) => ({ ...i })),
});

/** Add or edit a project (owner only; the API rejects anyone else). */
export function ProjectEditor({ open, project, defaultCategory = "website", onClose, onSaved }: Props) {
  return (
    <Modal
      open={open}
      title={project ? `${project.title} Properties` : "New Project"}
      icon={<FolderIcon size={18} />}
      onClose={onClose}
      wide
    >
      {open && <ProjectForm project={project} defaultCategory={defaultCategory} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function ProjectForm({ project, defaultCategory = "website", onClose, onSaved }: Omit<Props, "open">) {
  const [form, setForm] = useState<ProjectInput>(() => (project ? fromProject(project) : empty(defaultCategory)));
  const [tab, setTab] = useState<TabId>("general");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
            <SelectField
              label="Type"
              value={form.category}
              options={CATEGORY_LABELS}
              onChange={(v) => set("category", v)}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={STATUS_LABELS}
              onChange={(v) => set("status", v)}
            />
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
            hint="One or two lines, shown on the project card."
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
            label="Overview"
            rows={6}
            placeholder="What it is and what it does."
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

      {tab === "case" && (
        <div className="flex flex-col gap-5">
          <p className="text-[14px] text-muted">
            Optional. Recruiters like seeing how you think. Empty sections are hidden on the project page.
          </p>
          <TextArea
            label="The problem"
            rows={5}
            placeholder={isDesign ? "The brief and who it was for." : "What problem it solves and for whom."}
            value={form.problem}
            onChange={(e) => set("problem", e.target.value)}
            maxLength={10000}
          />
          <TextArea
            label="Process"
            rows={6}
            placeholder="Research, sketches, decisions, challenges and how you solved them."
            value={form.process}
            onChange={(e) => set("process", e.target.value)}
            maxLength={10000}
          />
          <TextArea
            label="Outcome"
            rows={5}
            placeholder="Results, numbers, feedback, what you learned."
            value={form.outcome}
            onChange={(e) => set("outcome", e.target.value)}
            maxLength={10000}
          />
        </div>
      )}

      {tab === "media" && (
        <div className="flex flex-col gap-6">
          <ImageUploader
            label="Cover image (shown on the card)"
            value={form.coverMediaId}
            onChange={(id) => set("coverMediaId", id)}
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
          <CheckboxField
            label="Published"
            hint="Untick to keep it as a draft. Drafts are only visible to you."
            checked={form.published}
            onChange={(v) => set("published", v)}
          />
          <CheckboxField
            label="Featured"
            hint="Shown in the featured slideshow and pinned to the top."
            checked={form.featured}
            onChange={(v) => set("featured", v)}
          />
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
      <DialogButtons busy={busy} onCancel={onClose} okLabel={project ? "OK" : "Add project"} />
    </form>
  );
}
