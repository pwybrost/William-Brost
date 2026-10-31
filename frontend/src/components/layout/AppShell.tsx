import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useEditMode } from "../../context/EditModeContext";
import { Battery, RecDot } from "../ui/Misc";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `label px-3 py-2 transition-colors ${
    isActive ? "bg-lcd text-phosphor glow" : "text-silver hover:text-phosphor"
  }`;

export function AppShell() {
  const { user, isAdmin, isGuest, logout } = useAuth();
  const { editing, toggle } = useEditMode();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-black bg-body/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
          <NavLink to="/" className="font-display text-2xl leading-none text-silver-light">
            WB<span className="text-stamp">.</span>
          </NavLink>

          <nav className="flex items-center gap-1" aria-label="Main">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/portfolio" className={navClass}>
              Portfolio
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3 text-silver">
            {isAdmin && (
              <button
                type="button"
                onClick={toggle}
                className={`label cursor-pointer border px-2 py-1 ${
                  editing ? "border-amber text-amber" : "border-silver-dark text-silver-dark"
                }`}
                title="Switch between editing and seeing the site like a visitor"
              >
                {editing ? "● Edit mode" : "○ Visitor view"}
              </button>
            )}
            <span className="label hidden text-muted sm:inline">
              {user ? `${user.displayName}${isAdmin ? " [owner]" : ""}` : isGuest ? "Guest" : ""}
            </span>
            {user ? (
              <button type="button" className="label cursor-pointer hover:text-rec" onClick={onLogout}>
                Sign out
              </button>
            ) : (
              <button type="button" className="label cursor-pointer hover:text-phosphor" onClick={onLogout}>
                Sign in
              </button>
            )}
            <span className="hidden items-center gap-3 md:flex">
              <RecDot />
              <Battery />
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t-2 border-black bg-body px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-muted">
          <span className="label">© {new Date().getFullYear()} William Brost</span>
          <span className="label">Made with React · Node · Postgres</span>
        </div>
      </footer>
    </div>
  );
}
