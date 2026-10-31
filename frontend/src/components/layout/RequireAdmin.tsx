import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { LoadingScreen } from "../ui/Misc";

/** Owner-only pages. Everyone else is sent home. (The API also enforces this.) */
export function RequireAdmin() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen text="CHECKING ACCESS" />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
