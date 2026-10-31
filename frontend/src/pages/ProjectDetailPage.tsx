import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import { Lightbox } from "../components/ui/Lightbox";
import { DateStamp, EditButton, LoadingScreen } from "../components/ui/Misc";
import { Panel } from "../components/ui/Panel";
import { useEditMode } from "../context/EditModeContext";
import { ProjectEditor } from "../features/portfolio/ProjectEditor";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { api, errorMessage, mediaUrl } from "../lib/api";
import { CATEGORY_LABELS, STATUS_LABELS, type Project, type ProjectImage } from "../lib/types";

export function ProjectDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { editing } = useEditMode();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);

  useDocumentTitle(project?.title ?? "Project");

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
        <Panel title="ERROR" icon="⚠">
          <p className="text-rec">! {error}</p>
          <RouterLink to="/portfolio" className="btn mt-4">
            ◀ Back to portfolio
          </RouterLink>
        </Panel>
      </div>
    );
  }
  if (!project) return <LoadingScreen text="LOADING IMAGE" />;

  // The lightbox browses the cover followed by the gallery.
  const viewerImages: ProjectImage[] = [
    ...(project.coverMediaId ? [{ mediaId: project.coverMediaId, caption: project.title }] : []),
    ...project.images,
  ];
  const galleryOffset = project.coverMediaId ? 1 : 0;
  const cover = mediaUrl(project.coverMediaId ?? project.images[0]?.mediaId);

  const properties: [string, string][] = [
    ["Type", CATEGORY_LABELS[project.category]],
    ["Role", project.role],
    ["Year", project.year],
    ["Status", STATUS_LABELS[project.status]],
  ];

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
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
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

      {!project.published && (
        <p className="bevel label px-3 py-2 text-rec">● Draft: only you can see this project</p>
      )}

      <div className="bevel p-1">
        <button
          type="button"
          disabled={viewerImages.length === 0}
          onClick={() => setViewing(0)}
          className="viewfinder lcd scanlines bevel-inset relative block aspect-video w-full cursor-zoom-in overflow-hidden disabled:cursor-default [--vf-size:30px]"
          aria-label="Open image viewer"
        >
          {cover ? (
            <img src={cover} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-display text-8xl text-phosphor-dim">
              {project.title.slice(0, 1).toUpperCase()}
            </span>
          )}
          <DateStamp className="absolute right-4 bottom-2 z-[3]" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">
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

          {project.description && (
            <Panel title="README.TXT" icon="✎">
              <p className="prose-retro">{project.description}</p>
            </Panel>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <Panel title="PROPERTIES" icon="ⓘ">
            <dl className="flex flex-col gap-2 text-sm">
              {properties
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-phosphor-dim/30 pb-1.5">
                    <dt className="label text-phosphor-dim">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
            </dl>
          </Panel>

          {project.techStack.length > 0 && (
            <Panel title={project.category === "graphic_design" ? "TOOLS" : "TECH STACK"} icon="⚙">
              <ul className="flex flex-wrap gap-2">
                {project.techStack.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </aside>
      </div>

      {project.images.length > 0 && (
        <Panel title={`GALLERY (${project.images.length})`} icon="▣" status="Click an image to view it full size">
          <ul
            className={`grid gap-3 ${
              project.category === "graphic_design" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {project.images.map((img, i) => (
              <li key={img.id ?? img.mediaId}>
                <button
                  type="button"
                  onClick={() => setViewing(i + galleryOffset)}
                  className="group viewfinder bevel-inset relative block w-full cursor-zoom-in overflow-hidden bg-black [--vf-size:12px]"
                >
                  <img
                    src={mediaUrl(img.mediaId) ?? ""}
                    alt={img.caption}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      project.category === "graphic_design" ? "aspect-square" : "aspect-video"
                    }`}
                  />
                  <span className="stamp absolute right-2 bottom-1 z-[3] text-base">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                </button>
                {img.caption && <p className="mt-1.5 text-xs text-text/80">{img.caption}</p>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Lightbox images={viewerImages} index={viewing} onIndexChange={setViewing} />

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
