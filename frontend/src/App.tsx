import { BrowserRouter, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { RequireAdmin } from "./components/layout/RequireAdmin";
import { RequireEntry } from "./components/layout/RequireEntry";
import { SystemDialogProvider } from "./components/win98/SystemDialog";
import { AuthProvider } from "./context/AuthContext";
import { EditModeProvider } from "./context/EditModeContext";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InboxPage } from "./pages/InboxPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <EditModeProvider>
        <BrowserRouter>
          <SystemDialogProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

              {/* Everything below needs a signed-in user or a guest */}
              <Route element={<RequireEntry />}>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="portfolio" element={<PortfolioPage />} />
                  <Route path="portfolio/projects/:id" element={<ProjectDetailPage />} />
                  {/* Owner only */}
                  <Route element={<RequireAdmin />}>
                    <Route path="inbox" element={<InboxPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SystemDialogProvider>
        </BrowserRouter>
      </EditModeProvider>
    </AuthProvider>
  );
}
