import { useState } from "react";
import { EditButton, LoadingScreen } from "../components/ui/Misc";
import { Panel } from "../components/ui/Panel";
import { useEditMode } from "../context/EditModeContext";
import { ProfileEditor } from "../features/portfolio/ProfileEditor";
import { ProfileHeader } from "../features/portfolio/ProfileHeader";
import { ProjectCard } from "../features/portfolio/ProjectCard";
import { ProjectEditor } from "../features/portfolio/ProjectEditor";
import { SocialLinksEditor } from "../features/portfolio/SocialLinksEditor";
import { TimelineEditor } from "../features/portfolio/TimelineEditor";
import { TimelineSection } from "../features/portfolio/TimelineSection";
import { usePortfolio } from "../hooks/usePortfolio";
import { api, errorMessage } from "../lib/api";
import type { Project, TimelineEntry, TimelineKind } from "../lib/types";

type Dialog =
  | { type: "profile" }
  | { type: "links" }
  | { type: "project"; project: Project | null }
  | { type: "timeline"; kind: TimelineKind; entry: TimelineEntry | null }
  | null;

export function PortfolioPage() {
  const { data, error, loading, reload } = usePortfolio();
  const { editing } = useEditMode();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  if (loading) return <LoadingScreen text="READING MEMORY CARD" />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <Panel title="ERROR">
          <p className="text-rec">! {error ?? "Could not load the portfolio"}</p>
          <button type="button" className="btn mt-4" onClick={() => void reload()}>
            Retry
          </button>
        </Panel>
      </div>
    );
  }

  const { profile, socialLinks, projects, experience, education } = data;

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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <ProfileHeader
        profile={profile}
        socialLinks={socialLinks}
        editing={editing}
        onEditProfile={() => setDialog({ type: "profile" })}
        onEditLinks={() => setDialog({ type: "links" })}
      />

      {(profile.bio || profile.skills.length > 0 || editing) && (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Panel
            title="ABOUT.TXT"
            actions={editing && <EditButton onClick={() => setDialog({ type: "profile" })} />}
          >
            {profile.bio ? (
              <p className="prose-retro">{profile.bio}</p>
            ) : (
              <p className="text-sm text-muted">No bio yet. Click edit to write one.</p>
            )}
          </Panel>
          <Panel
            title="SKILLS.CFG"
            actions={editing && <EditButton onClick={() => setDialog({ type: "profile" })} />}
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
          <span className="stamp text-xl">{String(projects.length).padStart(3, "0")} SHOTS</span>
        </div>

        {projects.length === 0 && !editing ? (
          <Panel title="EMPTY">
            <p className="text-sm text-muted">No projects published yet. Check back soon.</p>
          </Panel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
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
                <span className="label">New project</span>
              </button>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <TimelineSection
          title="EXPERIENCE.LOG"
          entries={experience}
          editing={editing}
          emptyText="No experience added yet."
          onAdd={() => setDialog({ type: "timeline", kind: "experience", entry: null })}
          onEdit={(entry) => setDialog({ type: "timeline", kind: "experience", entry })}
          onDelete={(e) => void deleteEntry(e)}
        />
        <TimelineSection
          title="EDUCATION.LOG"
          entries={education}
          editing={editing}
          emptyText="No education added yet."
          onAdd={() => setDialog({ type: "timeline", kind: "education", entry: null })}
          onEdit={(entry) => setDialog({ type: "timeline", kind: "education", entry })}
          onDelete={(e) => void deleteEntry(e)}
        />
      </div>

      {/* Owner-only editors. The API rejects these writes for anyone else. */}
      {editing && (
        <>
          <ProfileEditor
            open={dialog?.type === "profile"}
            profile={profile}
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
