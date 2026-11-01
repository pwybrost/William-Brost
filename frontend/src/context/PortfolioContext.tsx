import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { Portfolio } from "../lib/types";

interface PortfolioState {
  data: Portfolio | null;
  error: string | null;
  loading: boolean;
  /** re-fetches everything (call after saving an edit) */
  reload: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioState | null>(null);

/**
 * Loads the portfolio once for the whole desktop, so moving between windows is instant
 * and every window shows the same data.
 */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setData(await api.portfolio());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when the signed-in account changes: the owner also gets drafts.
  const { user } = useAuth();
  const userKey = `${user?.id ?? "guest"}:${user?.role ?? ""}`;
  useEffect(() => {
    void reload();
  }, [reload, userKey]);

  return <PortfolioContext.Provider value={{ data, error, loading, reload }}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside <PortfolioProvider>");
  return ctx;
}
