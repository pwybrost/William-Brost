import { OwnerButton } from "../components/ui/OwnerButton";
import { AppWindow, PageHeader, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { CheckIcon } from "../components/win98/Icons";
import { useEditMode } from "../context/EditModeContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useEditors } from "../features/editors/EditorsProvider";

/** Splits "Frontend: React" into group "Frontend" and skill "React". Ungrouped skills go to "Skills". */
function groupSkills(skills: string[]) {
  const groups = new Map<string, string[]>();
  for (const s of skills) {
    const i = s.indexOf(":");
    const group = i > 0 ? s.slice(0, i).trim() : "Skills";
    const name = i > 0 ? s.slice(i + 1).trim() : s;
    if (!name) continue;
    groups.set(group, [...(groups.get(group) ?? []), name]);
  }
  return [...groups.entries()];
}

/** Tools and technologies, grouped like installed components in a Setup dialog. */
export function StackPage() {
  const { data, error, loading } = usePortfolio();
  const { editing } = useEditMode();
  const editors = useEditors();

  if (loading || error || !data) {
    return (
      <AppWindow title="Stack">
        <WindowMessage>{error ?? <PleaseWait />}</WindowMessage>
      </AppWindow>
    );
  }

  const groups = groupSkills(data.profile.skills);
  // Also count how often each technology appears across projects.
  const usage = new Map<string, number>();
  for (const p of data.projects)
    for (const t of p.techStack) usage.set(t.toLowerCase(), (usage.get(t.toLowerCase()) ?? 0) + 1);

  return (
    <AppWindow title="Stack - Installed Components" status={[`${data.profile.skills.length} component(s) installed`]}>
      <PageHeader
        eyebrow="Stack"
        title="Tools I use"
        intro="Languages, frameworks and design tools I work with."
        actions={editing && <OwnerButton onClick={() => editors.editProfile("skills")}>Edit skills...</OwnerButton>}
      />

      {groups.length === 0 ? (
        <WindowMessage>
          {editing ? "No skills yet. Click “Edit skills...” to add some." : "Nothing listed yet."}
        </WindowMessage>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map(([group, items], gi) => (
            <fieldset key={group} className="win-group animate-fade-up" style={{ animationDelay: `${gi * 80}ms` }}>
              <legend>{group}</legend>
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((s) => {
                  const n = usage.get(s.toLowerCase()) ?? 0;
                  return (
                    <li
                      key={s}
                      className="flex items-center gap-2.5 px-2 py-1.5 text-[15px] transition-colors hover:bg-accent hover:text-accent-fg"
                    >
                      <CheckIcon size={18} />
                      <span className="flex-1">{s}</span>
                      {n > 0 && (
                        <span className="font-mono text-[12px] opacity-75" title={`Used in ${n} project(s)`}>
                          {n} proj.
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
        </div>
      )}
    </AppWindow>
  );
}
