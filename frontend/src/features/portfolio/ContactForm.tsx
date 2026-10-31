import { useId, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CheckIcon, KeyIcon, MailIcon } from "../../components/win98/Icons";
import { SavingProgress } from "../../components/win98/ProgressBar";
import { Window } from "../../components/win98/Window";
import { useAuth } from "../../context/AuthContext";
import { api, errorMessage } from "../../lib/api";
import type { MessageInput } from "../../lib/types";

/** Inline "User name: [____]" row, like the Windows logon dialog. */
function Row({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="grid items-center gap-1 sm:grid-cols-[90px_1fr] sm:gap-3">
      <label htmlFor={htmlFor} className="text-[12px]">
        <u>{label[0]}</u>
        {label.slice(1)}:
      </label>
      {children}
    </div>
  );
}

/**
 * Lets visitors (signed in or guest) send a message, styled as the Windows 98 "Welcome"
 * logon dialog. Messages land in the owner's inbox.
 */
export function ContactForm({ id, ownerName }: { id?: string; ownerName: string }) {
  const { user } = useAuth();
  const blank = (): MessageInput => ({
    name: user?.displayName ?? "",
    email: user?.email ?? "",
    subject: "",
    body: "",
    website: "",
  });
  const [form, setForm] = useState<MessageInput>(blank);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const ids = { name: useId(), email: useId(), subject: useId(), body: useId() };

  const set = <K extends keyof MessageInput>(key: K, value: MessageInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.sendMessage(form);
      setSent(true);
      setForm(blank());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Window
      id={id}
      title={sent ? "Setup" : "Welcome"}
      icon={<MailIcon size={14} />}
      body="face"
      bodyClassName="p-5"
      className="mx-auto w-full max-w-2xl"
    >
      {sent ? (
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="flex items-center gap-4">
            <CheckIcon size={40} />
            <p className="text-[13px]">Message sent. {ownerName} will get back to you by email.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="win-button min-w-24" onClick={() => setSent(false)}>
              OK
            </button>
            <button type="button" className="win-button min-w-24" onClick={() => setSent(false)}>
              Send another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <KeyIcon size={48} className="hidden sm:block" />
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-[12px]">
              Type your name and email to send {ownerName} a message. Internships, collaborations, or just saying hi.
            </p>
            <Row label="Name" htmlFor={ids.name}>
              <input
                id={ids.name}
                className="input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                maxLength={80}
              />
            </Row>
            <Row label="Email" htmlFor={ids.email}>
              <input
                id={ids.email}
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                maxLength={254}
              />
            </Row>
            <Row label="Subject" htmlFor={ids.subject}>
              <input
                id={ids.subject}
                className="input"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                maxLength={140}
              />
            </Row>
            <Row label="Message" htmlFor={ids.body}>
              <textarea
                id={ids.body}
                className="input resize-y"
                rows={5}
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                required
                minLength={5}
                maxLength={5000}
              />
            </Row>
            {/* Honeypot for spam bots: hidden from people and screen readers */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
            {error && (
              <p role="alert" className="win-sunken px-2 py-1 text-[12px] text-[#c00000]">
                {error}
              </p>
            )}
            {busy && <SavingProgress percent={null} label="Sending" />}
            <div className="flex justify-end gap-2 pt-2">
              <button type="submit" className="win-button min-w-24" disabled={busy}>
                OK
              </button>
              <button type="button" className="win-button min-w-24" disabled={busy} onClick={() => setForm(blank())}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </Window>
  );
}
