import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import { DateStamp, EditButton, LoadingScreen } from "../components/ui/Misc";
import { Panel } from "../components/ui/Panel";
import { useEditMode } from "../context/EditModeContext";
import { ProjectEditor } from "../features/portfolio/ProjectEditor";
import { api, errorMessage, mediaUrl } from "../lib/api";
import type { Project } from "../lib/types";

export function ProjectDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { editing } = useEditMode();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProject(null);
    setError(null);
    api
      .project(id)
      .then(({ project }) => !cancelled && setProject(project))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <Panel title="ERROR">
          <p className="text-rec">! {error}</p>
          <RouterLink to="/portfolio" className="btn mt-4">
            ◀ Back to portfolio
          </RouterLink>
        </Panel>
      </div>
    );
  }
  if (!project) return <LoadingScreen text="LOADING IMAGE" />;

  const cover = mediaUrl(project.coverMediaId);

  const onDelete = async () => {
    if (!window.confirm(`Delete "${project.title}"? This can't be undone.`)) return;
    try {
      await api.deleteProject(project.id);
      navigate("/portfolio", { replace: true });
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <RouterLink to="/portfolio" className="label text-silver hover:text-phosphor">
          ◀ Back to portfolio
        </RouterLink>
        {editing && (
          <div className="flex gap-2">
            <EditButton onClick={() => setEditorOpen(true)} />
            <EditButton onClick={() => void onDelete()} className="btn-lcd px-2.5 py-1 text-[10px] text-rec">
              ✕ Delete
            </EditButton>
          </div>
        )}
      </div>

      <div className="bevel p-1">
        <div className="viewfinder lcd scanlines bevel-inset relative aspect-video overflow-hidden [--vf-size:30px]">
          {cover ? (
            <img src={cover} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-display text-8xl text-phosphor-dim">
              {project.title.slice(0, 1).toUpperCase()}
            </span>
          )}
          <DateStamp className="absolute right-4 bottom-2 z-[3]" />
        </div>
      </div>

      <header className="flex flex-col gap-2">
        {project.featured && <span className="label text-amber">★ Featured project</span>}
        <h1 className="font-display text-6xl leading-none text-silver-light">{project.title}</h1>
        {project.summary && <p className="text-phosphor">{project.summary}</p>}
      </header>

      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.links.map((l) => (
            <a key={l.id ?? l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn">
              {l.label} ↗
            </a>
          ))}
        </div>
      )}

      {project.techStack.length > 0 && (
        <Panel title="TECH STACK">
          <ul className="flex flex-wrap gap-2">
            {project.techStack.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {project.description && (
        <Panel title="README.TXT">
          <p className="prose-retro">{project.description}</p>
        </Panel>
      )}

      {editing && (
        <ProjectEditor
          open={editorOpen}
          project={project}
          onClose={() => setEditorOpen(false)}
          onSaved={setProject}
        />
      )}
    </div>
  );
}
