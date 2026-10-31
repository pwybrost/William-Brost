import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import type { User } from "../lib/types";

const GUEST_KEY = "wb_guest";

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isAdmin: boolean;
  /** true once the user is signed in or chose "continue as guest" */
  hasEntered: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (displayName: string, email: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === "1");
  const [loading, setLoading] = useState(true);

  // Restore the session from the httpOnly cookie on first load.
  useEffect(() => {
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const enterAsUser = (u: User) => {
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    enterAsUser((await api.login(email, password)).user);
  }, []);

  const signup = useCallback(async (displayName: string, email: string, password: string) => {
    enterAsUser((await api.signup(displayName, email, password)).user);
  }, []);

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, "1");
    setIsGuest(true);
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isGuest: !user && isGuest,
      isAdmin: user?.role === "admin",
      hasEntered: Boolean(user) || isGuest,
      loading,
      login,
      signup,
      continueAsGuest,
      logout,
    }),
    [user, isGuest, loading, login, signup, continueAsGuest, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
