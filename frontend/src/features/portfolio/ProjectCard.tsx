import { Link as RouterLink } from "react-router";
import { EditButton } from "../../components/ui/Misc";
import { mediaUrl } from "../../lib/api";
import type { Project } from "../../lib/types";

interface Props {
  project: Project;
  index: number;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** A project shown like a printed photo from a memory card, with its frame number. */
export function ProjectCard({ project, index, editing, onEdit, onDelete }: Props) {
  const cover = mediaUrl(project.coverMediaId);
  const frame = `No.${String(index + 1).padStart(3, "0")}`;

  return (
    <article className="group bevel flex flex-col p-1 transition-transform hover:-translate-y-1">
      <RouterLink
        to={`/portfolio/projects/${project.id}`}
        className="viewfinder lcd scanlines bevel-inset relative block aspect-video overflow-hidden [--vf-size:14px]"
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-[filter] duration-300 group-hover:saturate-150"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-display text-4xl text-phosphor-dim">
            {project.title.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="stamp absolute right-2 bottom-1 z-[3] text-lg">{frame}</span>
        {project.featured && (
          <span className="label absolute top-2 left-2 z-[3] bg-amber px-1.5 py-0.5 text-ink">★ Featured</span>
        )}
      </RouterLink>

      <div className="flex flex-1 flex-col gap-3 bg-body p-4">
        <RouterLink to={`/portfolio/projects/${project.id}`}>
          <h3 className="font-display text-3xl leading-none text-silver-light hover:text-phosphor">
            {project.title}
          </h3>
        </RouterLink>
        {project.summary && <p className="text-sm text-text/90">{project.summary}</p>}

        {project.techStack.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {project.techStack.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {project.links.map((l) => (
            <a
              key={l.id ?? l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="label text-amber hover:underline"
            >
              {l.label} ↗
            </a>
          ))}
        </div>

        {editing && (
          <div className="flex gap-2 border-t border-black/60 pt-3">
            <EditButton onClick={onEdit} />
            <EditButton onClick={onDelete} className="btn-lcd px-2.5 py-1 text-[10px] text-rec">
              ✕ Delete
            </EditButton>
          </div>
        )}
      </div>
    </article>
  );
}
