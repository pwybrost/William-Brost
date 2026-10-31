import type { Link } from "../../lib/types";

interface LinkListEditorProps {
  label: string;
  links: Link[];
  onChange: (links: Link[]) => void;
  labelPlaceholder?: string;
  max?: number;
}

/** Editable list of {label, url} rows. Empty by default, add as many as needed. */
export function LinkListEditor({
  label,
  links,
  onChange,
  labelPlaceholder = "GitHub",
  max = 20,
}: LinkListEditorProps) {
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
    <fieldset className="flex flex-col gap-2">
      <legend className="label mb-1.5 text-phosphor-dim">{label}</legend>
      {links.length === 0 && <p className="text-xs text-muted">No links yet (optional).</p>}
      {links.map((link, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input sm:w-36"
            placeholder={labelPlaceholder}
            value={link.label}
            onChange={(e) => update(i, { label: e.target.value })}
            aria-label={`Link ${i + 1} label`}
          />
          <input
            className="input flex-1"
            placeholder="https://..."
            type="url"
            value={link.url}
            onChange={(e) => update(i, { url: e.target.value })}
            aria-label={`Link ${i + 1} URL`}
          />
          <div className="flex gap-1">
            <button type="button" className="btn-lcd px-2" onClick={() => move(i, -1)} aria-label="Move up">
              ▲
            </button>
            <button type="button" className="btn-lcd px-2" onClick={() => move(i, 1)} aria-label="Move down">
              ▼
            </button>
            <button
              type="button"
              className="btn-lcd px-2 text-rec"
              onClick={() => onChange(links.filter((_, idx) => idx !== i))}
              aria-label="Remove link"
            >
              DEL
            </button>
          </div>
        </div>
      ))}
      {links.length < max && (
        <button
          type="button"
          className="btn-lcd self-start"
          onClick={() => onChange([...links, { label: "", url: "" }])}
        >
          + Add link
        </button>
      )}
    </fieldset>
  );
}

/** Drops completely empty rows before saving. */
export const cleanLinks = (links: Link[]) =>
  links
    .map((l) => ({ ...l, label: l.label.trim(), url: l.url.trim() }))
    .filter((l) => l.label || l.url);
