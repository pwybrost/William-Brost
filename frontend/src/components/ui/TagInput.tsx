import { useId, useState } from "react";
import type { KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  hint?: string;
}

/** Type a tag and press Enter or comma to add it. Backspace on an empty input removes the last one. */
export function TagInput({
  label,
  value,
  onChange,
  placeholder,
  hint = "Press Enter or comma to add.",
}: TagInputProps) {
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
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label}
      </label>
      <div className="win-field flex flex-wrap items-center gap-1.5">
        {value.map((tag) => (
          <span key={tag} className="win-chip py-0.5">
            {tag}
            <button
              type="button"
              className="cursor-pointer px-0.5 text-[15px] leading-none hover:text-danger"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
            >
              ×
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
          className="min-w-32 flex-1 bg-transparent py-0.5 outline-none placeholder:text-muted"
        />
      </div>
      <p className="text-[13px] text-muted">{hint}</p>
    </div>
  );
}
