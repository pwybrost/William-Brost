import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Lightbox } from "../components/ui/Lightbox";
import { LoadingScreen } from "../components/ui/Misc";
import { Desktop } from "../components/win98/Desktop";
import { ErrorIcon, GlobeIcon, PictureIcon } from "../components/win98/Icons";
import { useSystemDialog } from "../components/win98/SystemDialog";
import { AddressBar, ToolButton, Window } from "../components/win98/Window";
import { useEditMode } from "../context/EditModeContext";
import { ProjectEditor } from "../features/portfolio/ProjectEditor";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { api, errorMessage, mediaUrl } from "../lib/api";
import { CATEGORY_LABELS, STATUS_LABELS, type Project, type ProjectImage } from "../lib/types";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** One project, shown inside a Windows 98 "Web Browser" window. */
export function ProjectDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { editing } = useEditMode();
  const dialogs = useSystemDialog();
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
      <Desktop>
        <Window title="Error" icon={null} body="face" bodyClassName="p-5" className="mx-auto max-w-md">
          <div className="flex items-center gap-4">
            <ErrorIcon />
            <p className="text-[12px]">{error}</p>
          </div>
          <div className="mt-4 flex justify-center">
            <button type="button" className="win-button min-w-24" onClick={() => navigate("/portfolio")}>
              OK
            </button>
          </div>
        </Window>
      </Desktop>
    );
  }
  if (!project) return <LoadingScreen text="LOADING IMAGE" />;

  // The viewer browses the cover followed by the gallery.
  const viewerImages: ProjectImage[] = [
    ...(project.coverMediaId ? [{ mediaId: project.coverMediaId, caption: project.title }] : []),
    ...project.images,
  ];
  const galleryOffset = project.coverMediaId ? 1 : 0;
  const cover = mediaUrl(project.coverMediaId ?? project.images[0]?.mediaId);
  const isDesign = project.category === "graphic_design";

  const properties: [string, string][] = [
    ["Type", CATEGORY_LABELS[project.category]],
    ["Role", project.role],
    ["Year", project.year],
    ["Status", STATUS_LABELS[project.status]],
  ];

  const onDelete = async () => {
    if (
      !(await dialogs.confirm({
        title: "Confirm File Delete",
        message: `Delete "${project.title}"?\nThis can't be undone.`,
      }))
    )
      return;
    try {
      await api.deleteProject(project.id);
      navigate("/portfolio", { replace: true });
    } catch (err) {
      await dialogs.error({ message: errorMessage(err) });
    }
  };

  return (
    <Desktop>
      <Window
        title={`${project.title} - Web Browser`}
        icon={<GlobeIcon size={14} />}
        menu={
          editing
            ? [
                { label: "Edit project...", onClick: () => setEditorOpen(true) },
                { label: "Delete", onClick: () => void onDelete() },
              ]
            : [{ label: "File" }, { label: "Edit" }, { label: "View" }, { label: "Favorites" }, { label: "Help" }]
        }
        toolbar={
          <>
            <ToolButton label="Back to portfolio" onClick={() => navigate("/portfolio")}>
              ←
            </ToolButton>
            <ToolButton label="Forward" disabled>
              →
            </ToolButton>
            <ToolButton label="Home" onClick={() => navigate("/")}>
              ⌂
            </ToolButton>
            <AddressBar>
              <GlobeIcon size={14} />
              <span className="truncate">http://williambrost/projects/{slug(project.title) || project.id}</span>
              <span className="ml-auto text-[#000080]" aria-hidden>
                ★
              </span>
            </AddressBar>
          </>
        }
        status={[
          project.published ? "Done" : "Draft: only you can see this project",
          `${project.images.length} image(s)`,
        ]}
        bodyClassName="p-0!"
      >
        <article className="flex flex-col gap-6 p-4 sm:p-6">
          {!project.published && (
            <p className="win-sunken bg-[#ffffe1]! px-3 py-2 text-[12px]">
              This project is a <b>draft</b>. Visitors can't see it until you publish it.
            </p>
          )}

          <button
            type="button"
            disabled={viewerImages.length === 0}
            onClick={() => setViewing(0)}
            className="win-sunken block aspect-video w-full cursor-zoom-in overflow-hidden bg-black! p-[2px] disabled:cursor-default"
            aria-label="Open image viewer"
          >
            {cover ? (
              <img src={cover} alt={project.title} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center bg-white">
                <PictureIcon size={64} />
              </span>
            )}
          </button>

          <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-4">
              <header className="flex flex-col gap-1">
                {project.featured && <span className="text-[12px] font-bold text-[#000080]">★ Featured project</span>}
                <h1 className="text-3xl font-bold sm:text-4xl">{project.title}</h1>
                {project.summary && <p className="text-[14px] text-[#303030]">{project.summary}</p>}
              </header>

              {project.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.links.map((l) => (
                    <a
                      key={l.id ?? l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="win-button"
                    >
                      <GlobeIcon size={14} />
                      {l.label}
                    </a>
                  ))}
                </div>
              )}

              {project.description && (
                <p className="text-[14px] leading-relaxed whitespace-pre-line">{project.description}</p>
              )}
            </div>

            <aside className="flex flex-col gap-4">
              <fieldset className="win-group bg-[#c0c0c0]">
                <legend>Properties</legend>
                <dl className="flex flex-col gap-1.5 text-[12px]">
                  {properties
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[60px_1fr] gap-2">
                        <dt className="text-[#404040]">{k}:</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
              </fieldset>

              {project.techStack.length > 0 && (
                <fieldset className="win-group bg-[#c0c0c0]">
                  <legend>{isDesign ? "Tools used" : "Tech stack"}</legend>
                  <ul className="flex flex-wrap gap-1">
                    {project.techStack.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}
            </aside>
          </div>

          {project.images.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-2 text-[13px] font-bold">
                <PictureIcon size={16} /> Gallery ({project.images.length})
              </h2>
              <ul className={`grid gap-3 ${isDesign ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                {project.images.map((img, i) => (
                  <li key={img.id ?? img.mediaId} className="group">
                    <button
                      type="button"
                      onClick={() => setViewing(i + galleryOffset)}
                      className="win-raised block w-full cursor-zoom-in p-[3px]"
                    >
                      <span className="win-sunken block overflow-hidden bg-black! p-[2px]">
                        <img
                          src={mediaUrl(img.mediaId) ?? ""}
                          alt={img.caption}
                          loading="lazy"
                          className={`w-full object-cover ${isDesign ? "aspect-square" : "aspect-video"}`}
                        />
                      </span>
                    </button>
                    <p className="mt-1 truncate text-center text-[11px]">
                      <span className="px-0.5 group-hover:bg-[#000080] group-hover:text-white">
                        {img.caption || `IMG_${String(i + 1).padStart(4, "0")}.JPG`}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </Window>

      <Lightbox images={viewerImages} index={viewing} onIndexChange={setViewing} />

      {editing && (
        <ProjectEditor open={editorOpen} project={project} onClose={() => setEditorOpen(false)} onSaved={setProject} />
      )}
    </Desktop>
  );
}
