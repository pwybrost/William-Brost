import { useId, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { DialogButtons, ErrorLine } from "../components/ui/Field";
import { OwnerButton } from "../components/ui/OwnerButton";
import { AppWindow, PageHeader, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { CheckIcon, KeyIcon } from "../components/win98/Icons";
import { useAuth } from "../context/AuthContext";
import { useEditMode } from "../context/EditModeContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useEditors } from "../features/editors/EditorsProvider";
import { api, errorMessage } from "../lib/api";
import type { MessageInput } from "../lib/types";

/** Contact form (styled like the Windows logon dialog) plus email, links and availability. */
export function ContactPage() {
  const { data, error, loading } = usePortfolio();
  const { editing } = useEditMode();
  const editors = useEditors();

  if (loading || error || !data) {
    return (
      <AppWindow title="Contact">
        <WindowMessage>{error ?? <PleaseWait />}</WindowMessage>
      </AppWindow>
    );
  }

  const { profile, socialLinks } = data;
  const firstName = profile.fullName.split(" ")[0] || profile.fullName;

  return (
    <AppWindow title="Contact - New Message">
      <PageHeader
        eyebrow="Contact"
        title="Let's talk"
        intro={`Internship, collaboration, a product question, or just saying hi. Messages go straight to ${firstName}.`}
        actions={
          editing && (
            <>
              <OwnerButton onClick={() => editors.editProfile("identity")}>Email & availability...</OwnerButton>
              <OwnerButton onClick={editors.editLinks}>Links...</OwnerButton>
            </>
          )
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ContactForm ownerName={firstName} />

        <aside className="flex flex-col gap-5">
          <fieldset className="win-group">
            <legend>Availability</legend>
            <p className="flex items-center gap-2.5 text-[15px]">
              <span
                aria-hidden
                className={`size-2.5 rounded-full ${profile.availability ? "animate-blink bg-ok" : "bg-line"}`}
              />
              {profile.availability || "Open to messages"}
            </p>
            {profile.location && <p className="mt-1 text-[15px] text-muted">{profile.location}</p>}
          </fieldset>
          {profile.contactEmail && (
            <fieldset className="win-group">
              <legend>Email</legend>
              <a href={`mailto:${profile.contactEmail}`} className="text-[15px] break-all text-link underline">
                {profile.contactEmail}
              </a>
            </fieldset>
          )}
          {socialLinks.length > 0 && (
            <fieldset className="win-group">
              <legend>Elsewhere</legend>
              <ul className="flex flex-col gap-2">
                {socialLinks.map((l) => (
                  <li key={l.id ?? l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="arrow-link">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </aside>
      </div>
    </AppWindow>
  );
}

function Row({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="grid items-center gap-1.5 sm:grid-cols-[100px_1fr] sm:gap-4">
      <label htmlFor={htmlFor} className="text-[15px]">
        <u>{label[0]}</u>
        {label.slice(1)}:
      </label>
      {children}
    </div>
  );
}

function ContactForm({ ownerName }: { ownerName: string }) {
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

  if (sent) {
    return (
      <div className="win-raised flex animate-pop flex-col items-center gap-5 p-8 text-center" role="status">
        <CheckIcon size={48} />
        <p className="text-[17px]">Message sent. {ownerName} will reply by email.</p>
        <button type="button" className="win-button-primary min-w-24" onClick={() => setSent(false)}>
          OK
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="win-raised flex flex-col gap-5 p-5 sm:flex-row sm:gap-6 sm:p-6">
      <KeyIcon size={48} className="hidden sm:block" />
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-[15px]">Type your name and email so {ownerName} can reply.</p>
        <Row label="Name" htmlFor={ids.name}>
          <input
            id={ids.name}
            className="win-field"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            maxLength={80}
          />
        </Row>
        <Row label="Email" htmlFor={ids.email}>
          <input
            id={ids.email}
            className="win-field"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            maxLength={254}
          />
        </Row>
        <Row label="Subject" htmlFor={ids.subject}>
          <input
            id={ids.subject}
            className="win-field"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            maxLength={140}
          />
        </Row>
        <Row label="Message" htmlFor={ids.body}>
          <textarea
            id={ids.body}
            className="win-field resize-y"
            rows={6}
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
        <ErrorLine message={error} />
        <DialogButtons busy={busy} onCancel={() => setForm(blank())} okLabel="Send" />
      </div>
    </form>
  );
}
