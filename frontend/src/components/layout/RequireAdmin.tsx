import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { LoadingScreen } from "../shell/Loading";

/** Owner-only pages. Everyone else is sent home. (The API also enforces this.) */
export function RequireAdmin() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen text="Checking access..." />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
