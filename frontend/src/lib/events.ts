/** Fired when inbox messages are read/deleted so the nav badge refreshes. */
export const INBOX_CHANGED = "wb:inbox-changed";

export const notifyInboxChanged = () => window.dispatchEvent(new Event(INBOX_CHANGED));
