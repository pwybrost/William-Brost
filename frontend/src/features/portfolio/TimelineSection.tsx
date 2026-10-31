import type { ReactNode } from "react";
import { CmdIcon } from "../../components/win98/Icons";
import { Window } from "../../components/win98/Window";
import type { TimelineEntry } from "../../lib/types";

interface Props {
  id?: string;
  title: string;
  /** file name used in the prompt, e.g. "experience.log" */
  fileName: string;
  entries: TimelineEntry[];
  editing: boolean;
  emptyText: string;
  /** "cmd" = Command Prompt window, "list" = white list with an icon per entry */
  variant?: "cmd" | "list";
  icon?: ReactNode;
  ownerName: string;
  onAdd: () => void;
  onEdit: (entry: TimelineEntry) => void;
  onDelete: (entry: TimelineEntry) => void;
}

const dates = (e: TimelineEntry) => [e.startDate, e.endDate].filter(Boolean).join(" - ");

/** Experience / education / achievements as a Windows 98 window. */
export function TimelineSection({
  id,
  title,
  fileName,
  entries,
  editing,
  emptyText,
  variant = "list",
  icon,
  ownerName,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  if (!entries.length && !editing) return null;

  const ownerButtons = (e: TimelineEntry) =>
    editing && (
      <span className="mt-2 flex gap-1">
        <button type="button" className="win-button px-2 text-[11px]" onClick={() => onEdit(e)}>
          Edit...
        </button>
        <button type="button" className="win-button px-2 text-[11px]" onClick={() => onDelete(e)}>
          Delete
        </button>
      </span>
    );

  const toolbar = editing ? (
    <button type="button" className="win-button" onClick={onAdd}>
      + Add entry...
    </button>
  ) : undefined;

  if (variant === "cmd") {
    return (
      <Window
        id={id}
        title={`${title} - Command Prompt`}
        icon={<CmdIcon size={14} />}
        toolbar={toolbar}
        body="black"
        bodyClassName="font-mono text-[13px] leading-relaxed"
        status={[`${entries.length} entr${entries.length === 1 ? "y" : "ies"}`]}
      >
        <p>
          C:\Users\{ownerName}&gt; type {fileName}
        </p>
        {entries.length === 0 ? (
          <p className="mt-2 text-[#808080]">{emptyText}</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-5">
            {entries.map((e) => (
              <li key={e.id}>
                {dates(e) && <p className="text-[#ffff55]">[{dates(e)}]</p>}
                <p className="font-bold text-white">{e.title}</p>
                {(e.organization || e.location) && (
                  <p className="text-[#55ffff]">{[e.organization, e.location].filter(Boolean).join(" · ")}</p>
                )}
                {e.description && <p className="mt-1 whitespace-pre-line">{e.description}</p>}
                {ownerButtons(e)}
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4">
          C:\Users\{ownerName}&gt;<span className="animate-blink">_</span>
        </p>
      </Window>
    );
  }

  return (
    <Window id={id} title={title} icon={icon} toolbar={toolbar} status={[`${entries.length} item(s)`]}>
      {entries.length === 0 ? (
        <p className="text-[12px] text-[#606060]">{emptyText}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-dotted divide-[#808080]">
          {entries.map((e) => (
            <li key={e.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className="pt-0.5">{icon}</span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-[13px] font-bold">{e.title}</h3>
                  {dates(e) && <span className="text-[11px] text-[#505050]">{dates(e)}</span>}
                </div>
                {(e.organization || e.location) && (
                  <p className="text-[12px] text-[#000080]">
                    {[e.organization, e.location].filter(Boolean).join(" · ")}
                  </p>
                )}
                {e.description && <p className="mt-1 text-[12px] whitespace-pre-line">{e.description}</p>}
                {ownerButtons(e)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Window>
  );
}
