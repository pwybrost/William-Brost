import { useId, useState } from "react";
import type { KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

/** Type a tag and press Enter or comma to add it. Backspace on empty input removes the last one. */
export function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");

  const add = () => {
    const tag = draft.trim().replace(/,$/, "");
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label text-phosphor-dim">
        {label}
      </label>
      <div className="input flex flex-wrap items-center gap-1.5">
        {value.map((tag) => (
          <span key={tag} className="chip">
            {tag}
            <button
              type="button"
              className="cursor-pointer hover:text-rec"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
            >
              x
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={value.length ? "" : placeholder}
          className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-phosphor-dim"
        />
      </div>
      <p className="text-xs text-muted">Press Enter or comma to add.</p>
    </div>
  );
}
