import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { FolderIcon, PictureIcon } from "../../components/win98/Icons";
import { AddressBar, ToolButton, Window } from "../../components/win98/Window";
import { mediaUrl } from "../../lib/api";
import { CATEGORY_LABELS, STATUS_LABELS, type Project, type ProjectCategory } from "../../lib/types";

type Folder = "all" | ProjectCategory;

const FOLDER_ORDER: ProjectCategory[] = ["graphic_design", "website", "app", "other"];
const FOLDER_NAMES: Record<ProjectCategory, string> = {
  graphic_design: "Graphic Design",
  website: "Websites",
  app: "Apps",
  other: "Other",
};

interface Props {
  id?: string;
  ownerName: string;
  projects: Project[];
  editing: boolean;
  onNew: (category: ProjectCategory) => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}

/** Projects shown as a Windows 98 Explorer window: category folders, address bar and search. */
export function ProjectExplorer({ id, ownerName, projects, editing, onNew, onEdit, onDelete }: Props) {
  const [folder, setFolder] = useState<Folder>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<ProjectCategory, number> = { graphic_design: 0, website: 0, app: 0, other: 0 };
    for (const p of projects) c[p.category] += 1;
    return c;
  }, [projects]);

  const q = search.trim().toLowerCase();
  const shown = projects.filter(
    (p) =>
      (folder === "all" || p.category === folder) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))),
  );
  const folders = FOLDER_ORDER.filter((c) => editing || counts[c] > 0);
  const drafts = shown.filter((p) => !p.published).length;
  const newCategory: ProjectCategory = folder === "all" ? "website" : folder;
  const path = `C:\\Users\\${ownerName}\\Projects${folder === "all" ? "" : `\\${FOLDER_NAMES[folder]}`}`;

  return (
    <Window
      id={id}
      title={folder === "all" ? "Projects" : FOLDER_NAMES[folder]}
      icon={<FolderIcon size={14} open />}
      menu={
        editing
          ? [
              { label: "New project...", onClick: () => onNew(newCategory) },
              { label: "View all", onClick: () => setFolder("all") },
            ]
          : [{ label: "File" }, { label: "Edit" }, { label: "View" }, { label: "Help" }]
      }
      toolbar={
        <>
          <ToolButton label="Back" onClick={() => setFolder("all")} disabled={folder === "all"}>
            ←
          </ToolButton>
          <ToolButton label="Up one level" onClick={() => setFolder("all")} disabled={folder === "all"}>
            ⤴
          </ToolButton>
          <AddressBar>
            <FolderIcon size={14} />
            <span className="truncate">{path}</span>
          </AddressBar>
          <label className="win-sunken flex w-full items-center gap-1 px-1.5 py-[3px] text-[12px] sm:w-48">
            <span aria-hidden>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              aria-label="Search projects"
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </label>
          {editing && (
            <button type="button" className="win-button font-bold" onClick={() => onNew(newCategory)}>
              + New project
            </button>
          )}
        </>
      }
      status={[
        `${shown.length} object(s)${drafts ? `, ${drafts} draft(s) hidden from visitors` : ""}`,
        editing ? "Owner" : "Read-only",
      ]}
      bodyClassName="min-h-64"
    >
      {/* Category folders (only at the top level) */}
      {folder === "all" && folders.length > 0 && !q && (
        <ul className="mb-4 flex flex-wrap gap-2 border-b border-dotted border-[#808080] pb-3">
          {folders.map((c) => (
            <li key={c}>
              <button
                type="button"
                onDoubleClick={() => setFolder(c)}
                onClick={() => setFolder(c)}
                className="group flex w-24 cursor-pointer flex-col items-center gap-1 p-1 text-center text-[12px]"
              >
                <FolderIcon size={40} />
                <span className="px-0.5 group-hover:bg-[#000080] group-hover:text-white group-focus:bg-[#000080] group-focus:text-white">
                  {FOLDER_NAMES[c]}
                </span>
                <span className="text-[10px] text-[#606060]">{counts[c]} item(s)</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {shown.length === 0 && !editing ? (
        <p className="py-10 text-center text-[12px] text-[#606060]">
          {q ? "No projects match your search." : "This folder is empty."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProjectTile
              key={p.id}
              project={p}
              editing={editing}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p)}
            />
          ))}
          {editing && (
            <li>
              <button
                type="button"
                onClick={() => onNew(newCategory)}
                className="flex h-full min-h-56 w-full cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#808080] text-[12px] hover:bg-[#000080]/5"
              >
                <span className="text-4xl leading-none">+</span>
                New {folder === "all" ? "project" : CATEGORY_LABELS[folder].toLowerCase()}...
              </button>
            </li>
          )}
        </ul>
      )}
    </Window>
  );
}

function ProjectTile({
  project,
  editing,
  onEdit,
  onDelete,
}: {
  project: Project;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cover = mediaUrl(project.coverMediaId ?? project.images[0]?.mediaId);
  const meta = [CATEGORY_LABELS[project.category], project.year].filter(Boolean).join(" · ");
  const href = `/portfolio/projects/${project.id}`;

  return (
    <li className={`group flex flex-col ${project.published ? "" : "opacity-70"}`}>
      <RouterLink to={href} className="win-raised block p-[3px] focus:outline-none">
        <div className="win-sunken relative aspect-video overflow-hidden bg-black! p-[2px]">
          {cover ? (
            <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center bg-white">
              <PictureIcon size={40} />
            </span>
          )}
          <span className="absolute top-1 left-1 flex gap-1 text-[10px]">
            {project.featured && <span className="bg-[#ffd400] px-1 font-bold text-black">★ Featured</span>}
            {!project.published && <span className="bg-[#c00000] px-1 font-bold text-white">Draft</span>}
          </span>
          {project.images.length > 0 && (
            <span className="absolute right-1 bottom-1 bg-black/70 px-1 text-[10px] text-white">
              {project.images.length} image(s)
            </span>
          )}
        </div>
      </RouterLink>

      <div className="flex flex-1 flex-col gap-1.5 pt-2">
        <RouterLink
          to={href}
          className="self-start px-0.5 text-[13px] font-bold group-hover:bg-[#000080] group-hover:text-white focus:bg-[#000080] focus:text-white focus:outline-none"
        >
          {project.title}
        </RouterLink>
        <span className="text-[11px] text-[#505050]">
          {meta}
          {project.status !== "completed" && ` · ${STATUS_LABELS[project.status]}`}
        </span>
        {project.summary && <p className="line-clamp-2 text-[12px]">{project.summary}</p>}
        {project.techStack.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {project.techStack.slice(0, 6).map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        )}
        {project.links.length > 0 && (
          <div className="flex flex-wrap gap-x-3 text-[11px]">
            {project.links.map((l) => (
              <a
                key={l.id ?? l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#000080] underline"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
        {editing && (
          <div className="mt-auto flex gap-1 pt-1">
            <button type="button" className="win-button px-2 text-[11px]" onClick={onEdit}>
              Properties...
            </button>
            <button type="button" className="win-button px-2 text-[11px]" onClick={onDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
