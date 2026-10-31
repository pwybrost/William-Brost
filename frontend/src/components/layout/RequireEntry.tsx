import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { LoadingScreen } from "../ui/Misc";

/** Sends visitors to the sign-in screen until they sign in or choose "guest". */
export function RequireEntry() {
  const { hasEntered, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen text="BOOTING" />;
  if (!hasEntered) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
