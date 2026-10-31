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
      <label htmlFor={id} className="label text-phosphor-dim">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function TextField({ label, hint, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id}>
      <input id={id} className="input" {...props} />
    </FieldShell>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string };

export function TextArea({ label, hint, rows = 5, ...props }: TextAreaProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id}>
      <textarea id={id} rows={rows} className="input resize-y" {...props} />
    </FieldShell>
  );
}

export function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-rec/60 bg-rec/10 px-3 py-2 text-xs text-rec">
      ! {message}
    </p>
  );
}
