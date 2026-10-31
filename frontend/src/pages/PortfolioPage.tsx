import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { Desktop, type TaskItem } from "../components/win98/Desktop";
import {
  CertificateIcon,
  CheckIcon,
  CmdIcon,
  ComputerIcon,
  ErrorIcon,
  FolderIcon,
  GlobeIcon,
  MailIcon,
  NotepadIcon,
  PictureIcon,
} from "../components/win98/Icons";
import { useSystemDialog } from "../components/win98/SystemDialog";
import { Window } from "../components/win98/Window";
import { LoadingScreen } from "../components/ui/Misc";
import { useAuth } from "../context/AuthContext";
import { useEditMode } from "../context/EditModeContext";
import { ContactForm } from "../features/portfolio/ContactForm";
import { ProfileEditor, type ProfileTab } from "../features/portfolio/ProfileEditor";
import { ProfileHeader } from "../features/portfolio/ProfileHeader";
import { ProjectEditor } from "../features/portfolio/ProjectEditor";
import { ProjectExplorer } from "../features/portfolio/ProjectExplorer";
import { SocialLinksEditor } from "../features/portfolio/SocialLinksEditor";
import { TimelineEditor } from "../features/portfolio/TimelineEditor";
import { TimelineSection } from "../features/portfolio/TimelineSection";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { usePortfolio } from "../hooks/usePortfolio";
import { api, errorMessage } from "../lib/api";
import { OWNER_EMAIL } from "../lib/config";
import type { Profile, Project, ProjectCategory, TimelineEntry, TimelineKind } from "../lib/types";

type Dialog =
  | { type: "profile"; tab: ProfileTab }
  | { type: "links" }
  | { type: "project"; project: Project | null; category: ProjectCategory }
  | { type: "timeline"; kind: TimelineKind; entry: TimelineEntry | null }
  | null;

const TASKS: TaskItem[] = [
  { id: "profile", label: "User", icon: <ComputerIcon size={16} /> },
  { id: "about", label: "about.txt", icon: <NotepadIcon size={16} /> },
  { id: "projects", label: "Projects", icon: <FolderIcon size={16} open /> },
  { id: "experience", label: "Experience", icon: <CmdIcon size={16} /> },
  { id: "education", label: "Education", icon: <NotepadIcon size={16} /> },
  { id: "achievements", label: "Achievements", icon: <CertificateIcon size={16} /> },
  { id: "contact", label: "Contact", icon: <MailIcon size={16} /> },
];

export function PortfolioPage() {
  const { data, error, loading, reload } = usePortfolio();
  const { editing } = useEditMode();
  const { user, isAdmin } = useAuth();
  const dialogs = useSystemDialog();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  useDocumentTitle("Portfolio");

  if (loading) return <LoadingScreen text="READING MEMORY CARD" />;
  if (error || !data) {
    return (
      <Desktop>
        <Window title="Error" icon={null} body="face" bodyClassName="p-5" className="mx-auto max-w-md">
          <div className="flex items-center gap-4">
            <ErrorIcon />
            <p className="text-[12px]">{error ?? "Could not load the portfolio"}</p>
          </div>
          <div className="mt-4 flex justify-center">
            <button type="button" className="win-button min-w-24" onClick={() => void reload()}>
              Retry
            </button>
          </div>
        </Window>
      </Desktop>
    );
  }

  const { profile, socialLinks, projects, experience, education, achievements } = data;
  const firstName = profile.fullName.split(" ")[0] || profile.fullName;

  // Saves one or two fields right away (quick picture / cover buttons).
  const quickSave = async (patch: Partial<Profile>) => {
    await api.updateProfile({ ...profile, ...patch });
    await reload();
  };

  const newProject = (category: ProjectCategory = "website") => setDialog({ type: "project", project: null, category });

  const deleteProject = async (p: Project) => {
    if (
      !(await dialogs.confirm({ title: "Confirm File Delete", message: `Delete "${p.title}"?\nThis can't be undone.` }))
    )
      return;
    try {
      await api.deleteProject(p.id);
      await reload();
    } catch (err) {
      await dialogs.error({ message: errorMessage(err) });
    }
  };

  const deleteEntry = async (e: TimelineEntry) => {
    if (!(await dialogs.confirm({ message: `Delete "${e.title}"?` }))) return;
    try {
      await api.deleteTimeline(e.id);
      await reload();
    } catch (err) {
      await dialogs.error({ message: errorMessage(err) });
    }
  };

  const timelineProps = (kind: TimelineKind) => ({
    editing,
    ownerName: profile.fullName,
    onAdd: () => setDialog({ type: "timeline", kind, entry: null }),
    onEdit: (entry: TimelineEntry) => setDialog({ type: "timeline", kind, entry }),
    onDelete: (e: TimelineEntry) => void deleteEntry(e),
  });

  // Signed in with the owner email but the server hasn't promoted the account yet.
  const ownerNotActive = !isAdmin && user?.email.toLowerCase() === OWNER_EMAIL;

  return (
    <Desktop tasks={TASKS}>
      <div className="flex flex-col gap-6">
        {ownerNotActive && (
          <Window title="Owner account not active yet" icon={null} body="face" bodyClassName="p-4">
            <div className="flex items-start gap-4 text-[12px]">
              <ErrorIcon />
              <div className="flex flex-col gap-1">
                <p>
                  You're signed in as <b>{OWNER_EMAIL}</b>, but the server hasn't made this account the owner yet, so
                  the edit tools are hidden.
                </p>
                <p>
                  In <code>backend/.env</code> set <code>ADMIN_EMAIL={OWNER_EMAIL}</code> (or delete the line), restart
                  the backend, then refresh this page.
                </p>
              </div>
            </div>
          </Window>
        )}

        {editing && (
          <Window
            title="Control Panel"
            icon={<ComputerIcon size={14} />}
            status={["Only you can see this window. Visitors see the site read-only."]}
          >
            <ul className="flex flex-wrap gap-1">
              <ControlIcon
                icon={<PictureIcon />}
                label="Profile picture"
                onClick={() => setDialog({ type: "profile", tab: "photos" })}
              />
              <ControlIcon
                icon={<PictureIcon />}
                label="Cover photo"
                onClick={() => setDialog({ type: "profile", tab: "photos" })}
              />
              <ControlIcon
                icon={<ComputerIcon />}
                label="Name & headline"
                onClick={() => setDialog({ type: "profile", tab: "identity" })}
              />
              <ControlIcon
                icon={<NotepadIcon />}
                label="Bio & skills"
                onClick={() => setDialog({ type: "profile", tab: "about" })}
              />
              <ControlIcon icon={<GlobeIcon />} label="Account links" onClick={() => setDialog({ type: "links" })} />
              <ControlIcon icon={<FolderIcon />} label="New project" onClick={() => newProject()} />
              <ControlIcon
                icon={<CmdIcon />}
                label="Add experience"
                onClick={() => setDialog({ type: "timeline", kind: "experience", entry: null })}
              />
              <ControlIcon
                icon={<NotepadIcon />}
                label="Add education"
                onClick={() => setDialog({ type: "timeline", kind: "education", entry: null })}
              />
              <ControlIcon
                icon={<CertificateIcon />}
                label="Add achievement"
                onClick={() => setDialog({ type: "timeline", kind: "achievement", entry: null })}
              />
              <ControlIcon icon={<MailIcon />} label="Inbox" onClick={() => navigate("/inbox")} />
            </ul>
          </Window>
        )}

        <ProfileHeader
          id="profile"
          profile={profile}
          socialLinks={socialLinks}
          projectCount={projects.length}
          editing={editing}
          onEditProfile={() => setDialog({ type: "profile", tab: "identity" })}
          onEditLinks={() => setDialog({ type: "links" })}
          onQuickSave={quickSave}
        />

        {(profile.bio || profile.skills.length > 0 || editing) && (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Window
              id="about"
              title="about.txt - Notepad"
              icon={<NotepadIcon size={14} />}
              menu={[
                { label: "File" },
                editing
                  ? { label: "Edit", onClick: () => setDialog({ type: "profile", tab: "about" }) }
                  : { label: "Edit" },
                { label: "Search" },
                { label: "Help" },
              ]}
              bodyClassName="max-h-96 min-h-48 overflow-y-auto font-mono text-[13px] leading-relaxed"
            >
              {profile.bio ? (
                <p className="whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-[#808080]">(empty) Click Edit to write your bio.</p>
              )}
            </Window>

            <Window
              title="Skills"
              icon={<CheckIcon size={14} />}
              toolbar={
                editing ? (
                  <button
                    type="button"
                    className="win-button"
                    onClick={() => setDialog({ type: "profile", tab: "about" })}
                  >
                    Edit skills...
                  </button>
                ) : undefined
              }
              status={[`${profile.skills.length} installed`]}
            >
              {profile.skills.length ? (
                <ul className="flex flex-col gap-1.5">
                  {profile.skills.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-[12px]">
                      <CheckIcon size={16} />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] text-[#606060]">No skills listed yet.</p>
              )}
            </Window>
          </div>
        )}

        <ProjectExplorer
          id="projects"
          ownerName={profile.fullName}
          projects={projects}
          editing={editing}
          onNew={newProject}
          onEdit={(p) => setDialog({ type: "project", project: p, category: p.category })}
          onDelete={(p) => void deleteProject(p)}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <TimelineSection
            id="experience"
            title="Experience"
            fileName="experience.log"
            variant="cmd"
            entries={experience}
            emptyText="File not found. No experience added yet."
            {...timelineProps("experience")}
          />
          <TimelineSection
            id="education"
            title="Education"
            fileName="education.log"
            icon={<NotepadIcon size={24} />}
            entries={education}
            emptyText="No education added yet."
            {...timelineProps("education")}
          />
        </div>

        <TimelineSection
          id="achievements"
          title="Achievements & Certifications"
          fileName="achievements.log"
          icon={<CertificateIcon size={24} />}
          entries={achievements}
          emptyText="No certifications or awards added yet."
          {...timelineProps("achievement")}
        />

        {editing ? (
          <Window
            id="contact"
            title="Welcome"
            icon={<MailIcon size={14} />}
            body="face"
            bodyClassName="p-4"
            className="mx-auto w-full max-w-2xl"
          >
            <div className="flex items-center gap-4 text-[12px]">
              <MailIcon size={40} />
              <p>
                Visitors see a contact form here. Their messages go to your Inbox. Switch to “Visitor view” in the top
                bar to see the form.
              </p>
              <button type="button" className="win-button shrink-0" onClick={() => navigate("/inbox")}>
                Open Inbox
              </button>
            </div>
          </Window>
        ) : (
          <ContactForm id="contact" ownerName={firstName} />
        )}
      </div>

      {/* Owner-only editors. The API rejects these writes for anyone else. */}
      {editing && (
        <>
          <ProfileEditor
            open={dialog?.type === "profile"}
            profile={profile}
            initialTab={dialog?.type === "profile" ? dialog.tab : "identity"}
            onClose={close}
            onSaved={() => void reload()}
          />
          <SocialLinksEditor
            open={dialog?.type === "links"}
            links={socialLinks}
            onClose={close}
            onSaved={() => void reload()}
          />
          <ProjectEditor
            open={dialog?.type === "project"}
            project={dialog?.type === "project" ? dialog.project : null}
            defaultCategory={dialog?.type === "project" ? dialog.category : "website"}
            onClose={close}
            onSaved={() => void reload()}
          />
          <TimelineEditor
            open={dialog?.type === "timeline"}
            kind={dialog?.type === "timeline" ? dialog.kind : "experience"}
            entry={dialog?.type === "timeline" ? dialog.entry : null}
            onClose={close}
            onSaved={() => void reload()}
          />
        </>
      )}
    </Desktop>
  );
}

/** Big Control Panel shortcut: icon with a label underneath. */
function ControlIcon({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-24 cursor-pointer flex-col items-center gap-1 p-1.5 text-center text-[11px]"
      >
        {icon}
        <span className="px-0.5 group-hover:bg-[#000080] group-hover:text-white group-focus:bg-[#000080] group-focus:text-white">
          {label}
        </span>
      </button>
    </li>
  );
}
