import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { ErrorLine, TextField } from "../components/ui/Field";
import { Tabs } from "../components/ui/Tabs";
import { TitleBar } from "../components/ui/TitleBar";
import { LoadingScreen } from "../components/shell/Loading";
import { Wallpaper } from "../components/shell/Wallpaper";
import { KeyIcon, ThemeIcon } from "../components/win98/Icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { errorMessage } from "../lib/api";

type Tab = "signin" | "signup";

/** Windows-style logon dialog on the wallpaper: sign in, create an account, or continue as a guest. */
export function AuthPage() {
  const { hasEntered, loading, login, signup, continueAsGuest } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingScreen text="Starting up..." />;
  if (hasEntered) return <Navigate to={from} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (tab === "signin") await login(email, password);
      else await signup(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onGuest = () => {
    continueAsGuest();
    navigate(from, { replace: true });
  };

  return (
    <>
      <Wallpaper />
      <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-4">
        <h1 className="display animate-type text-center text-6xl text-white [text-shadow:3px_3px_0_rgb(0_0_0/0.55)] sm:text-8xl">
          William Brost
        </h1>

        <section
          aria-labelledby="logon-title"
          className="win-raised w-full max-w-lg animate-window-open p-[3px] shadow-[var(--wb-shadow)] [animation-delay:250ms]"
        >
          <TitleBar
            title="Welcome to William Brost"
            extra={
              <button
                type="button"
                className="title-btn"
                onClick={theme.toggle}
                aria-label={theme.resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title="Light / dark"
              >
                <ThemeIcon dark={theme.resolved === "light"} size={12} />
              </button>
            }
          />
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <KeyIcon size={48} className="shrink-0" />
              <p id="logon-title" className="text-[15px]">
                Sign in, create an account, or look around as a guest. You don't need an account to see the portfolio.
              </p>
            </div>

            <Tabs
              label="Account"
              value={tab}
              onChange={(t) => {
                setTab(t);
                setError(null);
              }}
              tabs={[
                { id: "signin", label: "Sign in" },
                { id: "signup", label: "Create account" },
              ]}
            />

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {tab === "signup" && (
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  maxLength={60}
                />
              )}
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                minLength={tab === "signup" ? 8 : undefined}
                hint={tab === "signup" ? "At least 8 characters." : undefined}
                required
              />
              <ErrorLine message={error} />
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button type="submit" className="win-button-primary min-w-28" disabled={busy}>
                  {busy ? "Please wait..." : tab === "signin" ? "OK" : "Create account"}
                </button>
                <button type="button" className="win-button min-w-28" onClick={onGuest}>
                  Continue as guest
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
