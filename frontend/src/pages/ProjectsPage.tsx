import { useId, useMemo, useState } from "react";
import { OwnerButton } from "../components/ui/OwnerButton";
import { AppWindow, PageHeader, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { FolderIcon } from "../components/win98/Icons";
import { useEditMode } from "../context/EditModeContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useEditors } from "../features/editors/EditorsProvider";
import { FeaturedCarousel } from "../features/projects/FeaturedCarousel";
import { ProjectCard } from "../features/projects/ProjectCard";
import type { Project, ProjectCategory } from "../lib/types";

type Folder = "all" | ProjectCategory;
type Sort = "custom" | "newest" | "oldest" | "az";

const FOLDERS: { id: Folder; label: string }[] = [
  { id: "all", label: "All" },
  { id: "graphic_design", label: "Graphic Design" },
  { id: "website", label: "Websites" },
  { id: "app", label: "Apps" },
  { id: "other", label: "Other" },
];

const SORTS: Record<Sort, string> = {
  custom: "Recommended",
  newest: "Newest first",
  oldest: "Oldest first",
  az: "A to Z",
};

const sorters: Record<Sort, ((a: Project, b: Project) => number) | null> = {
  custom: null, // the API already returns featured first, then the owner's order
  newest: (a, b) => (b.year || b.createdAt).localeCompare(a.year || a.createdAt),
  oldest: (a, b) => (a.year || a.createdAt).localeCompare(b.year || b.createdAt),
  az: (a, b) => a.title.localeCompare(b.title),
};

/** All projects: featured slideshow, then a filterable, searchable grid. */
export function ProjectsPage() {
  const { data, error, loading } = usePortfolio();
  const { editing } = useEditMode();
  const editors = useEditors();
  const [folder, setFolder] = useState<Folder>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("custom");
  const searchId = useId();
  const sortId = useId();

  const projects = data?.projects ?? [];
  const counts = useMemo(() => {
    const c: Record<Folder, number> = { all: projects.length, graphic_design: 0, website: 0, app: 0, other: 0 };
    for (const p of projects) c[p.category] += 1;
    return c;
  }, [projects]);

  if (loading || error || !data) {
    return (
      <AppWindow title="Projects - Explorer">
        <WindowMessage>{error ?? <PleaseWait />}</WindowMessage>
      </AppWindow>
    );
  }

  const q = search.trim().toLowerCase();
  const shown = projects.filter(
    (p) =>
      (folder === "all" || p.category === folder) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))),
  );
  const sorter = sorters[sort];
  if (sorter) shown.sort(sorter);
  const featured = projects.filter((p) => p.featured && p.published);
  const folders = FOLDERS.filter((f) => f.id === "all" || editing || counts[f.id] > 0);
  const newCategory: ProjectCategory = folder === "all" ? "website" : folder;

  return (
    <AppWindow title="Projects - Explorer" status={[`${shown.length} object(s)`, editing ? "Owner" : "Read-only"]}>
      <PageHeader
        eyebrow="Work"
        title="Projects"
        intro="Websites, apps and graphic design I've built. Open any project for the full story."
        actions={
          editing && <OwnerButton onClick={() => editors.editProject(null, newCategory)}>New project...</OwnerButton>
        }
      />

      {featured.length > 0 && folder === "all" && !q && (
        <div className="mb-14">
          <FeaturedCarousel projects={featured} />
        </div>
      )}

      {/* folder tabs + search + sort, like Explorer's toolbar */}
      <div className="mb-8 flex flex-col gap-4">
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={folder === f.id}
              onClick={() => setFolder(f.id)}
              className="win-button gap-2"
            >
              <FolderIcon size={18} open={folder === f.id} />
              {f.label}
              <span className="font-mono text-[12px] text-muted">{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={searchId} className="eyebrow">
              Search
            </label>
            <input
              id={searchId}
              type="search"
              className="win-field"
              placeholder="Search by name or technology"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={sortId} className="eyebrow">
              Sort
            </label>
            <select id={sortId} className="win-field" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {(Object.keys(SORTS) as Sort[]).map((s) => (
                <option key={s} value={s}>
                  {SORTS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <WindowMessage>{q ? "No projects match your search." : "This folder is empty."}</WindowMessage>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {shown.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              editing={editing}
              onEdit={() => editors.editProject(p)}
              onDelete={() => void editors.deleteProject(p)}
            />
          ))}
        </ul>
      )}
    </AppWindow>
  );
}
