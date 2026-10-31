import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useId } from "react";

interface FieldShellProps {
  label: string;
  hint?: string;
  id: string;
  children: ReactNode;
}

function FieldShell({ label, hint, id, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function TextField({ label, hint, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id}>
      <input id={id} className="win-field" aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
    </FieldShell>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string };

export function TextArea({ label, hint, rows = 5, ...props }: TextAreaProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id}>
      <textarea
        id={id}
        rows={rows}
        className="win-field resize-y leading-relaxed"
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
    </FieldShell>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
}

export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  const id = useId();
  return (
    <FieldShell label={label} id={id}>
      <select id={id} className="win-field" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {(Object.keys(options) as T[]).map((k) => (
          <option key={k} value={k}>
            {options[k]}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-[var(--wb-accent)]"
      />
      <span>
        <span className="block text-[14px] font-semibold">{label}</span>
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="win-sunken px-3 py-2 text-[14px] text-danger">
      {message}
    </p>
  );
}

/** Cancel / OK row at the bottom of every editor dialog. */
export function DialogButtons({
  busy,
  onCancel,
  okLabel = "OK",
}: {
  busy: boolean;
  onCancel: () => void;
  okLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="submit" className="win-button-primary min-w-24" disabled={busy}>
        {busy ? "Saving..." : okLabel}
      </button>
      <button type="button" className="win-button min-w-24" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
