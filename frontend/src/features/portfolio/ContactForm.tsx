import { useState } from "react";
import type { FormEvent } from "react";
import { ErrorLine, TextArea, TextField } from "../../components/ui/Field";
import { Panel } from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { api, errorMessage } from "../../lib/api";
import type { MessageInput } from "../../lib/types";

/** Lets visitors (signed in or guest) send William a message. It lands in the owner's inbox. */
export function ContactForm({ ownerName }: { ownerName: string }) {
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
    <Panel title="SEND_MESSAGE.EXE" icon="✉" status={sent ? "Message sent" : "Ready"}>
      {sent ? (
        <div className="flex flex-col items-start gap-4">
          <p className="font-display text-3xl text-phosphor glow">MESSAGE SENT ✓</p>
          <p className="text-sm">Thanks for reaching out. {ownerName} will get back to you by email.</p>
          <button type="button" className="btn-lcd" onClick={() => setSent(false)}>
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <p className="text-sm">
            Internship opportunity, collaboration, or just saying hi? Send {ownerName} a message.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={80} />
            <TextField
              label="Your email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              maxLength={254}
            />
          </div>
          <TextField label="Subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} maxLength={140} />
          <TextArea
            label="Message"
            rows={5}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            required
            minLength={5}
            maxLength={5000}
          />
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
          <ErrorLine message={error} />
          <button type="submit" className="btn self-start" disabled={busy}>
            {busy ? "Sending..." : "▶ Send message"}
          </button>
        </form>
      )}
    </Panel>
  );
}
