import { useCallback, useEffect, useState } from "react";
import { LoadingScreen } from "../components/ui/Misc";
import { Panel } from "../components/ui/Panel";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { api, errorMessage } from "../lib/api";
import { notifyInboxChanged } from "../lib/events";
import type { Message } from "../lib/types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Owner-only: messages sent through the portfolio contact form, in an Outlook Express style layout. */
export function InboxPage() {
  useDocumentTitle("Inbox");
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMessages((await api.messages()).messages);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (m: Message) =>
    setMessages((list) => list?.map((x) => (x.id === m.id ? m : x)) ?? null);

  const setRead = async (m: Message, isRead: boolean) => {
    try {
      replace((await api.markMessage(m.id, isRead)).message);
      notifyInboxChanged();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const open = (m: Message) => {
    setSelectedId(m.id);
    if (!m.isRead) void setRead(m, true);
  };

  const remove = async (m: Message) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await api.deleteMessage(m.id);
      setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
      setSelectedId(null);
      notifyInboxChanged();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <Panel title="ERROR" icon="⚠">
          <p className="text-rec">! {error}</p>
        </Panel>
      </div>
    );
  }
  if (!messages) return <LoadingScreen text="CHECKING MAIL" />;

  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <p className="label text-phosphor-dim">OWNER ONLY</p>
        <h1 className="font-display text-5xl leading-none text-silver-light">Inbox</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel
          title={`INBOX (${unread} UNREAD)`}
          icon="✉"
          flush
          actions={
            <button type="button" className="btn-lcd px-2.5 py-1 text-[10px]" onClick={() => void load()}>
              ⟳ Refresh
            </button>
          }
          status={`${messages.length} message(s)`}
        >
          {messages.length === 0 ? (
            <p className="p-5 text-sm text-muted">No messages yet. They show up here when visitors use the contact form.</p>
          ) : (
            <ul className="max-h-[60dvh] overflow-y-auto">
              {messages.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m)}
                    className={`flex w-full cursor-pointer flex-col gap-0.5 border-b border-phosphor-dim/30 px-4 py-3 text-left transition-colors hover:bg-lcd-light ${
                      m.id === selectedId ? "bg-win-navy/60" : ""
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${m.isRead ? "text-text/80" : "font-semibold text-phosphor"}`}>
                        {!m.isRead && "● "}
                        {m.name}
                      </span>
                      <span className="label shrink-0 text-muted">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="truncate text-xs text-muted">{m.subject || m.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={selected ? selected.subject || "(no subject)" : "READING PANE"}
          icon="✎"
          actions={
            selected && (
              <>
                <a
                  className="btn-lcd px-2.5 py-1 text-[10px] text-amber"
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your message"}`)}`}
                >
                  ↩ Reply by email
                </a>
                <button
                  type="button"
                  className="btn-lcd px-2.5 py-1 text-[10px]"
                  onClick={() => void setRead(selected, !selected.isRead)}
                >
                  Mark {selected.isRead ? "unread" : "read"}
                </button>
                <button
                  type="button"
                  className="btn-lcd px-2.5 py-1 text-[10px] text-rec"
                  onClick={() => void remove(selected)}
                >
                  ✕ Delete
                </button>
              </>
            )
          }
        >
          {selected ? (
            <article className="flex flex-col gap-4">
              <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 border-b border-phosphor-dim/40 pb-3 text-sm">
                <dt className="label text-phosphor-dim">From</dt>
                <dd>{selected.name}</dd>
                <dt className="label text-phosphor-dim">Email</dt>
                <dd className="break-all">{selected.email}</dd>
                <dt className="label text-phosphor-dim">Sent</dt>
                <dd>{formatDate(selected.createdAt)}</dd>
              </dl>
              <p className="prose-retro">{selected.body}</p>
            </article>
          ) : (
            <p className="text-sm text-muted">Select a message to read it.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
