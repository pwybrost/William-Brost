import { BrowserRouter, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { RequireEntry } from "./components/layout/RequireEntry";
import { AuthProvider } from "./context/AuthContext";
import { EditModeProvider } from "./context/EditModeContext";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <EditModeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            {/* Everything below needs a signed-in user or a guest */}
            <Route element={<RequireEntry />}>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="portfolio/projects/:id" element={<ProjectDetailPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </EditModeProvider>
    </AuthProvider>
  );
}
