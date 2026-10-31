import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { EditButton, LoadingScreen } from "../components/ui/Misc";
import { Panel } from "../components/ui/Panel";
import { useEditMode } from "../context/EditModeContext";
import { ContactForm } from "../features/portfolio/ContactForm";
import { ProfileEditor, type ProfileTab } from "../features/portfolio/ProfileEditor";
import { ProfileHeader } from "../features/portfolio/ProfileHeader";
import { ProjectCard } from "../features/portfolio/ProjectCard";
import { ProjectEditor } from "../features/portfolio/ProjectEditor";
import { SocialLinksEditor } from "../features/portfolio/SocialLinksEditor";
import { TimelineEditor } from "../features/portfolio/TimelineEditor";
import { TimelineSection } from "../features/portfolio/TimelineSection";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { usePortfolio } from "../hooks/usePortfolio";
import { api, errorMessage } from "../lib/api";
import {
  CATEGORY_LABELS,
  type Project,
  type ProjectCategory,
  type TimelineEntry,
  type TimelineKind,
} from "../lib/types";

type Dialog =
  | { type: "profile"; tab: ProfileTab }
  | { type: "links" }
  | { type: "project"; project: Project | null }
  | { type: "timeline"; kind: TimelineKind; entry: TimelineEntry | null }
  | null;

type Filter = "all" | ProjectCategory;

const CATEGORY_ORDER: ProjectCategory[] = ["graphic_design", "website", "app", "other"];

export function PortfolioPage() {
  const { data, error, loading, reload } = usePortfolio();
  const { editing } = useEditMode();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const close = () => setDialog(null);

  useDocumentTitle("Portfolio");

  const projects = data?.projects ?? [];
  const counts = useMemo(() => {
    const c: Record<ProjectCategory, number> = { graphic_design: 0, website: 0, app: 0, other: 0 };
    for (const p of projects) c[p.category] += 1;
    return c;
  }, [projects]);

  if (loading) return <LoadingScreen text="READING MEMORY CARD" />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <Panel title="ERROR" icon="⚠">
          <p className="text-rec">! {error ?? "Could not load the portfolio"}</p>
          <button type="button" className="btn mt-4" onClick={() => void reload()}>
            Retry
          </button>
        </Panel>
      </div>
    );
  }

  const { profile, socialLinks, experience, education, achievements } = data;
  // Show a filter tab per category that has projects (all of them while editing).
  const visibleCategories = CATEGORY_ORDER.filter((c) => editing || counts[c] > 0);
  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const drafts = projects.filter((p) => !p.published).length;

  const deleteProject = async (p: Project) => {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try {
      await api.deleteProject(p.id);
      await reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const deleteEntry = async (e: TimelineEntry) => {
    if (!window.confirm(`Delete "${e.title}"?`)) return;
    try {
      await api.deleteTimeline(e.id);
      await reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const timelineProps = (kind: TimelineKind) => ({
    editing,
    onAdd: () => setDialog({ type: "timeline", kind, entry: null }),
    onEdit: (entry: TimelineEntry) => setDialog({ type: "timeline", kind, entry }),
    onDelete: (e: TimelineEntry) => void deleteEntry(e),
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      {editing && (
        <div className="bevel flex flex-wrap items-center gap-3 px-3 py-2 text-ink">
          <span className="label">✎ Owner mode</span>
          <span className="text-xs">
            Everything with an edit button is yours to change. Use “Visitor view” in the top bar to preview.
          </span>
          {drafts > 0 && <span className="label ml-auto text-rec">{drafts} draft(s) hidden from visitors</span>}
        </div>
      )}

      <ProfileHeader
        profile={profile}
        socialLinks={socialLinks}
        editing={editing}
        onEditProfile={() => setDialog({ type: "profile", tab: "identity" })}
        onEditLinks={() => setDialog({ type: "links" })}
      />

      {(profile.bio || profile.skills.length > 0 || editing) && (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Panel
            title="ABOUT.TXT"
            icon="✎"
            actions={editing && <EditButton onClick={() => setDialog({ type: "profile", tab: "about" })} />}
          >
            {profile.bio ? (
              <p className="prose-retro">{profile.bio}</p>
            ) : (
              <p className="text-sm text-muted">No bio yet. Click edit to write one.</p>
            )}
          </Panel>
          <Panel
            title="SKILLS.CFG"
            icon="⚙"
            actions={editing && <EditButton onClick={() => setDialog({ type: "profile", tab: "about" })} />}
            status={`${profile.skills.length} skill(s)`}
          >
            {profile.skills.length ? (
              <ul className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No skills listed yet.</p>
            )}
          </Panel>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label text-phosphor-dim">DCIM / 100WBROST</p>
            <h2 className="font-display text-5xl leading-none text-silver-light">Projects</h2>
          </div>
          <span className="stamp text-xl">{String(shown.length).padStart(3, "0")} SHOTS</span>
        </div>

        {/* Category filter, like folder tabs */}
        {visibleCategories.length > 1 && (
          <div role="tablist" aria-label="Filter projects" className="flex flex-wrap gap-1">
            {(["all", ...visibleCategories] as Filter[]).map((f) => {
              const active = filter === f;
              const label = f === "all" ? "All" : CATEGORY_LABELS[f];
              const count = f === "all" ? projects.length : counts[f];
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={active ? "btn" : "btn-lcd"}
                >
                  {label} <span className="opacity-70">[{count}]</span>
                </button>
              );
            })}
          </div>
        )}

        {shown.length === 0 && !editing ? (
          <Panel title="EMPTY" icon="▢">
            <p className="text-sm text-muted">No projects here yet. Check back soon.</p>
          </Panel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                editing={editing}
                onEdit={() => setDialog({ type: "project", project: p })}
                onDelete={() => void deleteProject(p)}
              />
            ))}
            {editing && (
              <button
                type="button"
                onClick={() => setDialog({ type: "project", project: null })}
                className="viewfinder flex min-h-64 cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-phosphor-dim text-phosphor transition-colors hover:bg-lcd [--vf-color:var(--color-phosphor)]"
              >
                <span className="font-display text-6xl leading-none">+</span>
                <span className="label">
                  New {filter === "all" ? "project" : CATEGORY_LABELS[filter].toLowerCase()}
                </span>
              </button>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <TimelineSection
          title="EXPERIENCE.LOG"
          entries={experience}
          emptyText="No experience added yet."
          {...timelineProps("experience")}
        />
        <TimelineSection
          title="EDUCATION.LOG"
          entries={education}
          emptyText="No education added yet."
          {...timelineProps("education")}
        />
      </div>

      <TimelineSection
        title="ACHIEVEMENTS.LOG"
        entries={achievements}
        emptyText="No certifications or awards added yet."
        {...timelineProps("achievement")}
      />

      {editing ? (
        <Panel title="SEND_MESSAGE.EXE" icon="✉">
          <p className="text-sm">
            Visitors see a contact form here. Messages go to your{" "}
            <RouterLink to="/inbox" className="text-amber underline">
              inbox
            </RouterLink>
            . Switch to “Visitor view” to see the form.
          </p>
        </Panel>
      ) : (
        <ContactForm ownerName={profile.fullName.split(" ")[0] || profile.fullName} />
      )}

      {/* Owner-only editors. The API rejects these writes for anyone else. */}
      {editing && (
        <>
          <ProfileEditor
            open={dialog?.type === "profile"}
            profile={profile}
            initialTab={dialog?.type === "profile" ? dialog.tab : "identity"}
            onClose={close}
            onSaved={() => void reload()}
          />
          <SocialLinksEditor
            open={dialog?.type === "links"}
            links={socialLinks}
            onClose={close}
            onSaved={() => void reload()}
          />
          <ProjectEditor
            open={dialog?.type === "project"}
            project={dialog?.type === "project" ? dialog.project : null}
            defaultCategory={filter === "all" ? "website" : filter}
            onClose={close}
            onSaved={() => void reload()}
          />
          <TimelineEditor
            open={dialog?.type === "timeline"}
            kind={dialog?.type === "timeline" ? dialog.kind : "experience"}
            entry={dialog?.type === "timeline" ? dialog.entry : null}
            onClose={close}
            onSaved={() => void reload()}
          />
        </>
      )}
    </div>
  );
}
