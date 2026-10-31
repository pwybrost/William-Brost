import { EditButton } from "../../components/ui/Misc";
import { Panel } from "../../components/ui/Panel";
import type { TimelineEntry } from "../../lib/types";

interface Props {
  title: string;
  entries: TimelineEntry[];
  editing: boolean;
  emptyText: string;
  onAdd: () => void;
  onEdit: (entry: TimelineEntry) => void;
  onDelete: (entry: TimelineEntry) => void;
}

/** Work experience or education, shown as a log file. */
export function TimelineSection({ title, entries, editing, emptyText, onAdd, onEdit, onDelete }: Props) {
  if (!entries.length && !editing) return null;

  return (
    <Panel title={title} actions={editing && <EditButton onClick={onAdd}>+ Add</EditButton>}>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <ol className="flex flex-col gap-6 border-l border-phosphor-dim/60 pl-5">
          {entries.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute top-2 -left-[25px] size-2 bg-phosphor" aria-hidden />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-display text-2xl leading-tight text-phosphor">{e.title}</h3>
                {(e.startDate || e.endDate) && (
                  <span className="stamp text-lg">
                    {e.startDate}
                    {e.endDate && ` – ${e.endDate}`}
                  </span>
                )}
              </div>
              {(e.organization || e.location) && (
                <p className="label mt-0.5 text-silver">
                  {[e.organization, e.location].filter(Boolean).join(" · ")}
                </p>
              )}
              {e.description && <p className="prose-retro mt-2">{e.description}</p>}
              {editing && (
                <div className="mt-3 flex gap-2">
                  <EditButton onClick={() => onEdit(e)} />
                  <EditButton onClick={() => onDelete(e)} className="btn-lcd px-2.5 py-1 text-[10px] text-rec">
                    ✕ Delete
                  </EditButton>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
