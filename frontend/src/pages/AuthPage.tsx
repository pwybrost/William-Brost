import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { ErrorLine, TextField } from "../components/ui/Field";
import { DateStamp, LoadingScreen, RecDot } from "../components/ui/Misc";
import { TitleBar } from "../components/ui/TitleBar";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";

type Tab = "signin" | "signup";

const BOOT_LINES = [
  "WB-OS BIOS v2.003  (C) WILLIAM BROST",
  "MEMORY TEST ........ 65536K OK",
  "MEMORY CARD ........ DETECTED",
  "LENS ............... READY",
];

export function AuthPage() {
  const { hasEntered, loading, login, signup, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingScreen text="BOOTING" />;
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
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md animate-boot">
        <div className="mb-4 font-display text-lg leading-tight text-phosphor-dim">
          {BOOT_LINES.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="text-phosphor">
            PLEASE IDENTIFY YOURSELF<span className="animate-blink">_</span>
          </p>
        </div>

        <div className="bevel p-[3px]">
          <TitleBar title="LOGIN.EXE" icon="⚿" extra={<RecDot label="LIVE" />} />

          <div className="lcd bevel-inset scanlines mt-[3px] p-5">
            <div className="relative z-[2] flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-1" role="tablist">
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => {
                      setTab(t);
                      setError(null);
                    }}
                    className={tab === t ? "btn" : "btn-lcd"}
                  >
                    {t === "signin" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>

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
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? "Please wait..." : tab === "signin" ? "▶ Sign in" : "▶ Create account"}
                </button>
              </form>

              <div className="flex items-center gap-3 text-phosphor-dim">
                <span className="h-px flex-1 bg-phosphor-dim/50" />
                <span className="label">or</span>
                <span className="h-px flex-1 bg-phosphor-dim/50" />
              </div>

              <button type="button" className="btn-lcd" onClick={onGuest}>
                Continue as guest
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <DateStamp />
        </div>
      </div>
    </div>
  );
}
