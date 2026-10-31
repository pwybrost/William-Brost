import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { api } from "../lib/api";
import { INBOX_CHANGED } from "../lib/events";

/** Unread contact-form messages, for the owner's badges. Refreshes on navigation and inbox changes. */
export function useUnreadCount(enabled: boolean) {
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!enabled) return;
    const refresh = () =>
      api
        .unreadCount()
        .then((r) => setUnread(r.unread))
        .catch(() => {});
    refresh();
    window.addEventListener(INBOX_CHANGED, refresh);
    return () => window.removeEventListener(INBOX_CHANGED, refresh);
  }, [enabled, pathname]);

  return enabled ? unread : 0;
}
