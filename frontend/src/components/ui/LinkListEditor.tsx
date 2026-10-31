import type { Link } from "../../lib/types";

interface LinkListEditorProps {
  label: string;
  links: Link[];
  onChange: (links: Link[]) => void;
  labelPlaceholder?: string;
  max?: number;
}

/** Editable list of {label, url} rows. Empty by default; add as many as needed. */
export function LinkListEditor({ label, links, onChange, labelPlaceholder = "GitHub", max = 20 }: LinkListEditorProps) {
  const update = (i: number, patch: Partial<Link>) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <fieldset className="win-group flex flex-col gap-3">
      <legend>{label}</legend>
      {links.length === 0 && <p className="text-[14px] text-muted">No links yet (optional).</p>}
      {links.map((link, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row">
          <input
            className="win-field sm:w-40"
            placeholder={labelPlaceholder}
            value={link.label}
            onChange={(e) => update(i, { label: e.target.value })}
            aria-label={`Link ${i + 1} name`}
          />
          <input
            className="win-field flex-1"
            placeholder="https://..."
            type="url"
            value={link.url}
            onChange={(e) => update(i, { url: e.target.value })}
            aria-label={`Link ${i + 1} address`}
          />
          <div className="flex gap-1">
            <button type="button" className="win-button px-3" onClick={() => move(i, -1)} aria-label="Move up">
              ▲
            </button>
            <button type="button" className="win-button px-3" onClick={() => move(i, 1)} aria-label="Move down">
              ▼
            </button>
            <button
              type="button"
              className="win-button px-3"
              onClick={() => onChange(links.filter((_, idx) => idx !== i))}
              aria-label={`Remove link ${i + 1}`}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      {links.length < max && (
        <button
          type="button"
          className="win-button self-start"
          onClick={() => onChange([...links, { label: "", url: "" }])}
        >
          Add link...
        </button>
      )}
    </fieldset>
  );
}

/** Drops completely empty rows before saving. */
export const cleanLinks = (links: Link[]) =>
  links.map((l) => ({ ...l, label: l.label.trim(), url: l.url.trim() })).filter((l) => l.label || l.url);
