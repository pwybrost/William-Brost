import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Lightbox } from "../components/ui/Lightbox";
import { OwnerButton } from "../components/ui/OwnerButton";
import { AppWindow, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { GlobeIcon, PictureIcon } from "../components/win98/Icons";
import { useEditMode } from "../context/EditModeContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useEditors } from "../features/editors/EditorsProvider";
import { mediaUrl } from "../lib/api";
import { CATEGORY_LABELS, STATUS_LABELS, type ProjectImage } from "../lib/types";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** One project as a case study, inside a "Web Browser" window. */
export function ProjectDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, error, loading } = usePortfolio();
  const { editing } = useEditMode();
  const editors = useEditors();
  const [viewing, setViewing] = useState<number | null>(null);

  const all = data?.projects ?? [];
  const index = all.findIndex((p) => p.id === id);
  const project = index >= 0 ? all[index] : undefined;

  if (loading || error || !project) {
    return (
      <AppWindow title="Web Browser" icon={<GlobeIcon size={18} />} closeTo="/projects">
        <WindowMessage>
          {loading ? (
            <PleaseWait />
          ) : (
            <span className="flex flex-col items-center gap-4">
              {error ?? "This page cannot be displayed. The project may have been removed."}
              <Link to="/projects" className="win-button">
                Back to projects
              </Link>
            </span>
          )}
        </WindowMessage>
      </AppWindow>
    );
  }

  const prev = all[index - 1];
  const next = all[index + 1];
  const viewerImages: ProjectImage[] = [
    ...(project.coverMediaId ? [{ mediaId: project.coverMediaId, caption: project.title }] : []),
    ...project.images,
  ];
  const galleryOffset = project.coverMediaId ? 1 : 0;
  const cover = mediaUrl(project.coverMediaId ?? project.images[0]?.mediaId);
  const isDesign = project.category === "graphic_design";

  const facts: [string, string][] = (
    [
      ["Type", CATEGORY_LABELS[project.category]],
      ["Role", project.role],
      ["Year", project.year],
      ["Status", STATUS_LABELS[project.status]],
    ] as [string, string][]
  ).filter(([, v]) => v);

  const caseStudy = [
    { title: "The problem", text: project.problem },
    { title: "Process", text: project.process },
    { title: "Outcome", text: project.outcome },
  ].filter((s) => s.text);

  return (
    <AppWindow
      title={`${project.title} - Web Browser`}
      icon={<GlobeIcon size={18} />}
      closeTo="/projects"
      toolbar={
        <>
          <button
            type="button"
            className="win-button px-3"
            onClick={() => navigate("/projects")}
            aria-label="Back to projects"
            title="Back"
          >
            ←
          </button>
          <button
            type="button"
            className="win-button px-3"
            disabled={!next}
            onClick={() => next && navigate(`/projects/${next.id}`)}
            aria-label="Next project"
            title="Forward"
          >
            →
          </button>
          <button
            type="button"
            className="win-button px-3"
            onClick={() => navigate("/")}
            aria-label="Home"
            title="Home"
          >
            ⌂
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-[14px]">
            <span className="hidden text-muted sm:inline">Address</span>
            <div className="win-field flex min-h-9 min-w-0 flex-1 items-center gap-2 py-1">
              <GlobeIcon size={16} />
              <span className="truncate">williambrost/projects/{slug(project.title) || project.id}</span>
            </div>
          </div>
          {editing && (
            <>
              <OwnerButton onClick={() => editors.editProject(project)}>Edit...</OwnerButton>
              <OwnerButton
                onClick={async () => {
                  if (await editors.deleteProject(project)) navigate("/projects", { replace: true });
                }}
              >
                Delete
              </OwnerButton>
            </>
          )}
        </>
      }
      status={[
        project.published ? "Done" : "Draft: only you can see this project",
        `${project.images.length} image(s)`,
      ]}
    >
      <article className="flex flex-col gap-12">
        {!project.published && (
          <p className="win-sunken bg-note! px-4 py-3 text-[14px]">
            This project is a <b>draft</b>. Visitors can't see it until you publish it.
          </p>
        )}

        <header className="flex flex-col gap-4">
          <p className="eyebrow animate-fade-up">
            {project.featured && "★ Featured · "}
            {CATEGORY_LABELS[project.category]}
            {project.year && ` · ${project.year}`}
          </p>
          <h1 className="display animate-fade-up text-5xl [animation-delay:60ms] sm:text-7xl">{project.title}</h1>
          {project.summary && (
            <p className="max-w-3xl animate-fade-up text-[19px] text-muted [animation-delay:120ms]">
              {project.summary}
            </p>
          )}
          {project.links.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2">
              {project.links.map((l, i) => (
                <li key={l.id ?? l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={i === 0 ? "win-button-primary" : "win-button"}
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
        </header>

        <button
          type="button"
          disabled={viewerImages.length === 0}
          onClick={() => setViewing(0)}
          className="group win-sunken block aspect-video w-full animate-fade-up cursor-zoom-in overflow-hidden p-[2px] disabled:cursor-default"
          aria-label="Open image viewer"
        >
          {cover ? (
            <img
              src={cover}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full items-center justify-center">
              <PictureIcon size={72} />
            </span>
          )}
        </button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex flex-col gap-10">
            {project.description && (
              <section>
                <h2 className="eyebrow mb-3">Overview</h2>
                <p className="prose-text">{project.description}</p>
              </section>
            )}
            {caseStudy.map((s) => (
              <section key={s.title}>
                <h2 className="display mb-3 text-3xl">{s.title}</h2>
                <p className="prose-text">{s.text}</p>
              </section>
            ))}
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-0 lg:self-start">
            {facts.length > 0 && (
              <fieldset className="win-group">
                <legend>Properties</legend>
                <dl className="flex flex-col gap-2 text-[15px]">
                  {facts.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[72px_1fr] gap-2">
                      <dt className="text-muted">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </fieldset>
            )}
            {project.techStack.length > 0 && (
              <fieldset className="win-group">
                <legend>{isDesign ? "Tools used" : "Built with"}</legend>
                <ul className="flex flex-wrap gap-1.5">
                  {project.techStack.map((t) => (
                    <li key={t} className="win-chip">
                      {t}
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </aside>
        </div>

        {project.images.length > 0 && (
          <section aria-labelledby="gallery-title">
            <h2 id="gallery-title" className="display mb-5 text-3xl">
              Gallery
            </h2>
            <ul className={`grid gap-4 ${isDesign ? "grid-cols-2 md:grid-cols-3" : "sm:grid-cols-2"}`}>
              {project.images.map((img, i) => (
                <li key={img.id ?? img.mediaId}>
                  <button
                    type="button"
                    onClick={() => setViewing(i + galleryOffset)}
                    className="lift win-raised block w-full cursor-zoom-in p-[3px]"
                    aria-label={`View ${img.caption || `image ${i + 1}`}`}
                  >
                    <span className="win-sunken block overflow-hidden p-[2px]">
                      <img
                        src={mediaUrl(img.mediaId) ?? ""}
                        alt={img.caption}
                        loading="lazy"
                        className={`lift-img w-full object-cover ${isDesign ? "aspect-square" : "aspect-video"}`}
                      />
                    </span>
                  </button>
                  {img.caption && <p className="mt-2 text-[14px] text-muted">{img.caption}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* previous / next project */}
        <nav aria-label="More projects" className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link to={`/projects/${prev.id}`} className="lift win-raised flex flex-col gap-1 p-4">
              <span className="eyebrow">← Previous</span>
              <span className="text-[17px] font-semibold">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/projects/${next.id}`} className="lift win-raised flex flex-col gap-1 p-4 text-right">
              <span className="eyebrow">Next →</span>
              <span className="text-[17px] font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>

      <Lightbox images={viewerImages} index={viewing} onIndexChange={setViewing} />
    </AppWindow>
  );
}
