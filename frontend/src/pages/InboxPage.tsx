import { useCallback, useEffect, useState } from "react";
import { AppWindow, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { useSystemDialog } from "../components/win98/SystemDialog";
import { api, errorMessage } from "../lib/api";
import { notifyInboxChanged } from "../lib/events";
import type { Message } from "../lib/types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Owner-only: messages from the contact form, in an Outlook Express style two-pane layout. */
export function InboxPage() {
  const dialogs = useSystemDialog();
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

  const replace = (m: Message) => setMessages((list) => list?.map((x) => (x.id === m.id ? m : x)) ?? null);

  const setRead = async (m: Message, isRead: boolean) => {
    try {
      replace((await api.markMessage(m.id, isRead)).message);
      notifyInboxChanged();
    } catch (err) {
      void dialogs.error({ message: errorMessage(err) });
    }
  };

  const open = (m: Message) => {
    setSelectedId(m.id);
    if (!m.isRead) void setRead(m, true);
  };

  const remove = async (m: Message) => {
    if (!(await dialogs.confirm({ message: `Delete the message from ${m.name}?` }))) return;
    try {
      await api.deleteMessage(m.id);
      setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
      setSelectedId(null);
      notifyInboxChanged();
    } catch (err) {
      void dialogs.error({ message: errorMessage(err) });
    }
  };

  const selected = messages?.find((m) => m.id === selectedId) ?? null;
  const unread = messages?.filter((m) => !m.isRead).length ?? 0;

  return (
    <AppWindow
      title="Inbox - Outlook Express"
      contentClassName="flex h-full min-h-[480px] flex-col"
      toolbar={
        <>
          <button type="button" className="win-button" onClick={() => void load()}>
            ⟳ Send/Recv
          </button>
          {selected && (
            <>
              <a
                className="win-button"
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your message"}`)}`}
              >
                ↩ Reply
              </a>
              <button type="button" className="win-button" onClick={() => void setRead(selected, !selected.isRead)}>
                Mark as {selected.isRead ? "unread" : "read"}
              </button>
              <button type="button" className="win-button" onClick={() => void remove(selected)}>
                × Delete
              </button>
            </>
          )}
        </>
      }
      status={[`${messages?.length ?? 0} message(s), ${unread} unread`]}
    >
      {error ? (
        <WindowMessage>{error}</WindowMessage>
      ) : !messages ? (
        <WindowMessage>
          <PleaseWait text="Checking mail..." />
        </WindowMessage>
      ) : (
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(280px,380px)_1fr]">
          {/* message list */}
          <ul aria-label="Messages" className="min-h-0 overflow-y-auto border-b border-line md:border-r md:border-b-0">
            {messages.length === 0 && (
              <li className="p-6 text-[15px] text-muted">
                No messages yet. They appear here when visitors use the contact form.
              </li>
            )}
            {messages.map((m) => {
              const active = m.id === selectedId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m)}
                    aria-current={active}
                    className={`flex w-full cursor-pointer flex-col gap-0.5 border-b border-line/40 px-4 py-3 text-left transition-colors ${
                      active ? "bg-accent text-accent-fg" : "hover:bg-face"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-[15px] ${m.isRead ? "" : "font-bold"}`}>
                        {!m.isRead && <span aria-label="Unread">● </span>}
                        {m.name}
                      </span>
                      <span className="shrink-0 font-mono text-[12px] opacity-80">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="truncate text-[14px] opacity-80">{m.subject || m.body}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* reading pane */}
          <div className="min-h-0 overflow-y-auto p-6 sm:p-8">
            {selected ? (
              <article className="flex animate-fade-up flex-col gap-5">
                <h1 className="text-[22px] font-semibold">{selected.subject || "(no subject)"}</h1>
                <dl className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 border-b border-line pb-4 text-[15px]">
                  <dt className="text-muted">From</dt>
                  <dd>{selected.name}</dd>
                  <dt className="text-muted">Email</dt>
                  <dd className="break-all">
                    <a href={`mailto:${selected.email}`} className="text-link underline">
                      {selected.email}
                    </a>
                  </dd>
                  <dt className="text-muted">Sent</dt>
                  <dd>{formatDate(selected.createdAt)}</dd>
                </dl>
                <p className="prose-text text-fg!">{selected.body}</p>
              </article>
            ) : (
              <WindowMessage>Select a message to read it.</WindowMessage>
            )}
          </div>
        </div>
      )}
    </AppWindow>
  );
}
