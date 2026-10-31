import { BrowserRouter, Route, Routes } from "react-router";
import { RequireAdmin } from "./components/layout/RequireAdmin";
import { RequireEntry } from "./components/layout/RequireEntry";
import { Desktop } from "./components/shell/Desktop";
import { SystemDialogProvider } from "./components/win98/SystemDialog";
import { AuthProvider } from "./context/AuthContext";
import { EditModeProvider } from "./context/EditModeContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthPage } from "./pages/AuthPage";
import { ContactPage } from "./pages/ContactPage";
import { ControlPanelPage } from "./pages/ControlPanelPage";
import { DesktopPage } from "./pages/DesktopPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { InboxPage } from "./pages/InboxPage";
import { JourneyPage } from "./pages/JourneyPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ResumePage } from "./pages/ResumePage";
import { StackPage } from "./pages/StackPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EditModeProvider>
          <PortfolioProvider>
            <BrowserRouter>
              <SystemDialogProvider>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />

                  {/* Everything below needs a signed-in user or a guest */}
                  <Route element={<RequireEntry />}>
                    <Route element={<Desktop />}>
                      <Route index element={<HomePage />} />
                      <Route path="desktop" element={<DesktopPage />} />
                      <Route path="projects" element={<ProjectsPage />} />
                      <Route path="projects/:id" element={<ProjectDetailPage />} />
                      <Route path="gallery" element={<GalleryPage />} />
                      <Route path="journey" element={<JourneyPage />} />
                      <Route path="stack" element={<StackPage />} />
                      <Route path="resume" element={<ResumePage />} />
                      <Route path="contact" element={<ContactPage />} />
                      {/* Owner only */}
                      <Route element={<RequireAdmin />}>
                        <Route path="control-panel" element={<ControlPanelPage />} />
                        <Route path="inbox" element={<InboxPage />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </SystemDialogProvider>
            </BrowserRouter>
          </PortfolioProvider>
        </EditModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
