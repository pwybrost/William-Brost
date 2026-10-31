import { Link } from "react-router";
import { OwnerButton } from "../components/ui/OwnerButton";
import { AppWindow, PageHeader, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { PdfIcon } from "../components/win98/Icons";
import { useEditMode } from "../context/EditModeContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useEditors } from "../features/editors/EditorsProvider";
import { downloadUrl, mediaUrl } from "../lib/api";
import type { TimelineEntry } from "../lib/types";

const dates = (e: TimelineEntry) => [e.startDate, e.endDate].filter(Boolean).join(" – ");

/** Resume download plus a one-page summary built from the rest of the portfolio. */
export function ResumePage() {
  const { data, error, loading } = usePortfolio();
  const { editing } = useEditMode();
  const editors = useEditors();

  if (loading || error || !data) {
    return (
      <AppWindow title="Resume">
        <WindowMessage>{error ?? <PleaseWait />}</WindowMessage>
      </AppWindow>
    );
  }

  const { profile, experience, education, achievements, projects } = data;
  const pdf = profile.resumeMediaId;
  const hasResume = Boolean(pdf || profile.resumeUrl);
  const skills = profile.skills.map((s) => (s.includes(":") ? s.slice(s.indexOf(":") + 1).trim() : s));

  return (
    <AppWindow title="Resume - Document Viewer" status={[hasResume ? "Ready" : "No resume file yet"]}>
      <PageHeader
        eyebrow="Resume"
        title={profile.fullName}
        intro={profile.headline}
        actions={editing && <OwnerButton onClick={() => editors.editProfile("resume")}>Resume file...</OwnerButton>}
      />

      {/* the file itself */}
      <div className="win-sunken mb-12 flex flex-wrap items-center gap-5 px-5 py-5">
        <PdfIcon size={48} />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold">{pdf ? "William-Brost-Resume.pdf" : "Resume"}</p>
          <p className="text-[14px] text-muted">
            {hasResume ? "The full resume, ready to download." : "A summary is below. Ask me for the full resume."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {pdf ? (
            <>
              <a href={downloadUrl(pdf)} className="win-button-primary">
                Download PDF
              </a>
              <a href={mediaUrl(pdf) ?? "#"} target="_blank" rel="noopener noreferrer" className="win-button">
                Open ↗
              </a>
            </>
          ) : profile.resumeUrl ? (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="win-button-primary">
              Open resume ↗
            </a>
          ) : (
            <Link to="/contact" className="win-button-primary">
              Request resume
            </Link>
          )}
        </div>
      </div>

      {/* summary */}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-12">
          {[
            { title: "Experience", items: experience },
            { title: "Education", items: education },
          ]
            .filter((s) => s.items.length)
            .map((s) => (
              <section key={s.title}>
                <h2 className="display mb-5 text-3xl">{s.title}</h2>
                <ul className="flex flex-col gap-5">
                  {s.items.map((e) => (
                    <li key={e.id} className="border-l-2 border-line pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="text-[17px] font-semibold">{e.title}</h3>
                        <span className="eyebrow">{dates(e)}</span>
                      </div>
                      <p className="text-[15px] text-muted">
                        {[e.organization, e.location].filter(Boolean).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          {projects.length > 0 && (
            <section>
              <h2 className="display mb-5 text-3xl">Selected projects</h2>
              <ul className="flex flex-col gap-3">
                {projects.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/projects/${p.id}`}
                      className="group flex flex-wrap items-baseline justify-between gap-x-3"
                    >
                      <span className="text-[17px] font-semibold group-hover:underline">{p.title}</span>
                      <span className="eyebrow">{p.year}</span>
                    </Link>
                    {p.summary && <p className="text-[15px] text-muted">{p.summary}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="flex flex-col gap-5">
          {skills.length > 0 && (
            <fieldset className="win-group">
              <legend>Skills</legend>
              <ul className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <li key={s} className="win-chip">
                    {s}
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
          {achievements.length > 0 && (
            <fieldset className="win-group">
              <legend>Certifications</legend>
              <ul className="flex flex-col gap-2 text-[15px]">
                {achievements.map((a) => (
                  <li key={a.id}>
                    <span className="font-semibold">{a.title}</span>
                    {a.organization && <span className="text-muted"> · {a.organization}</span>}
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </aside>
      </div>
    </AppWindow>
  );
}
