import type { ReactNode } from "react";
import { OwnerButton } from "../components/ui/OwnerButton";
import { AppWindow, PageHeader, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { CertificateIcon, ComputerIcon, NotepadIcon } from "../components/win98/Icons";
import { useEditMode } from "../context/EditModeContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useEditors } from "../features/editors/EditorsProvider";
import type { TimelineEntry, TimelineKind } from "../lib/types";

const GROUPS: { kind: TimelineKind; title: string; icon: ReactNode; empty: string }[] = [
  { kind: "experience", title: "Experience", icon: <ComputerIcon size={24} />, empty: "No experience added yet." },
  { kind: "education", title: "Education", icon: <NotepadIcon size={24} />, empty: "No education added yet." },
  {
    kind: "achievement",
    title: "Certifications & awards",
    icon: <CertificateIcon size={24} />,
    empty: "Nothing here yet.",
  },
];

const dates = (e: TimelineEntry) => [e.startDate, e.endDate].filter(Boolean).join(" – ");

/** Experience, education and achievements as one timeline window. */
export function JourneyPage() {
  const { data, error, loading } = usePortfolio();
  const { editing } = useEditMode();
  const editors = useEditors();

  if (loading || error || !data) {
    return (
      <AppWindow title="Journey">
        <WindowMessage>{error ?? <PleaseWait />}</WindowMessage>
      </AppWindow>
    );
  }

  const byKind: Record<TimelineKind, TimelineEntry[]> = {
    experience: data.experience,
    education: data.education,
    achievement: data.achievements,
  };
  const visible = GROUPS.filter((g) => editing || byKind[g.kind].length > 0);
  const total = data.experience.length + data.education.length + data.achievements.length;

  return (
    <AppWindow title="Journey" status={[`${total} entr${total === 1 ? "y" : "ies"}`]}>
      <PageHeader
        eyebrow="Journey"
        title="Experience & education"
        intro="Where I've worked, studied and what I've earned along the way."
      />

      {visible.length === 0 && <WindowMessage>Nothing here yet.</WindowMessage>}

      <div className="flex flex-col gap-14">
        {visible.map((g) => (
          <section key={g.kind} aria-labelledby={`journey-${g.kind}`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 id={`journey-${g.kind}`} className="display flex items-center gap-3 text-3xl sm:text-4xl">
                {g.icon}
                {g.title}
              </h2>
              {editing && <OwnerButton onClick={() => editors.editTimeline(g.kind, null)}>Add...</OwnerButton>}
            </div>

            {byKind[g.kind].length === 0 ? (
              <p className="text-[15px] text-muted">{g.empty}</p>
            ) : (
              <ol className="relative flex flex-col gap-8 border-l-2 border-line pl-8">
                {byKind[g.kind].map((e, i) => (
                  <li key={e.id} className="relative animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                    {/* timeline marker */}
                    <span aria-hidden className="win-raised absolute top-1.5 -left-[41px] size-4" />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-[19px] font-semibold">{e.title}</h3>
                      {dates(e) && <span className="eyebrow">{dates(e)}</span>}
                    </div>
                    {(e.organization || e.location) && (
                      <p className="mt-1 text-[15px] text-muted">
                        {[e.organization, e.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {e.description && <p className="prose-text mt-3">{e.description}</p>}
                    {editing && (
                      <div className="mt-3 flex gap-1">
                        <OwnerButton onClick={() => editors.editTimeline(g.kind, e)}>Edit...</OwnerButton>
                        <OwnerButton onClick={() => void editors.deleteEntry(e)}>Delete</OwnerButton>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
    </AppWindow>
  );
}
