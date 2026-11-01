import { Link } from "react-router";
import { OwnerButton } from "../../components/ui/OwnerButton";
import { PictureIcon } from "../../components/win98/Icons";
import { mediaUrl } from "../../lib/api";
import { CATEGORY_LABELS, STATUS_LABELS, type Project } from "../../lib/types";

interface Props {
  project: Project;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  /** position, for the staggered entrance animation */
  index?: number;
}

/** Project tile: cover in a sunken frame, meta line, title, summary and tags. Lifts on hover. */
export function ProjectCard({ project, editing, onEdit, onDelete, index = 0 }: Props) {
  const cover = mediaUrl(project.coverMediaId ?? project.images[0]?.mediaId);
  const meta = [CATEGORY_LABELS[project.category], project.year].filter(Boolean).join(" · ");

  return (
    <li
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className={`lift win-raised relative flex animate-fade-up flex-col p-[3px] ${project.published ? "" : "opacity-70"}`}
    >
      <Link to={`/projects/${project.id}`} className="group flex flex-1 flex-col focus:outline-none">
        <div className="win-sunken relative aspect-[16/10] overflow-hidden p-[2px]">
          {cover ? (
            <img src={cover} alt="" loading="lazy" className="lift-img h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center">
              <PictureIcon size={48} />
            </span>
          )}
          <span className="absolute top-2 left-2 flex gap-1 text-[12px] font-bold">
            {project.featured && <span className="bg-[#ffd400] px-2 text-black">★ Featured</span>}
            {!project.published && <span className="bg-danger px-2 text-white">Draft</span>}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 px-3 pt-4 pb-3">
          <p className="eyebrow">
            {meta}
            {project.status !== "completed" && ` · ${STATUS_LABELS[project.status]}`}
          </p>
          <h3 className="text-[19px] leading-snug font-semibold group-hover:underline group-focus-visible:underline">
            {project.title}
          </h3>
          {project.summary && <p className="line-clamp-2 text-[15px] text-muted">{project.summary}</p>}
          {project.techStack.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Built with">
              {project.techStack.slice(0, 5).map((t) => (
                <li key={t} className="win-chip">
                  {t}
                </li>
              ))}
              {project.techStack.length > 5 && <li className="win-chip">+{project.techStack.length - 5}</li>}
            </ul>
          )}
        </div>
      </Link>
      {editing && (
        <div className="flex gap-1 px-3 pb-3">
          <OwnerButton onClick={onEdit}>Properties...</OwnerButton>
          <OwnerButton onClick={onDelete}>Delete</OwnerButton>
        </div>
      )}
    </li>
  );
}
