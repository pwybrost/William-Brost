import type { ReactNode } from "react";
import { Link } from "react-router";
import { AppWindow, PageHeader } from "../components/shell/AppWindow";
import {
  CertificateIcon,
  ComputerIcon,
  FolderIcon,
  GlobeIcon,
  InboxIcon,
  NotepadIcon,
  PdfIcon,
  PictureIcon,
  ShopIcon,
  CheckIcon,
} from "../components/win98/Icons";
import { useEditMode } from "../context/EditModeContext";
import { useEditors } from "../features/editors/EditorsProvider";

interface Applet {
  icon: ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  to?: string;
}

/** Owner-only: one place to change every part of the site. */
export function ControlPanelPage() {
  const editors = useEditors();
  const { editing, toggle } = useEditMode();

  const groups: { title: string; applets: Applet[] }[] = [
    {
      title: "Profile",
      applets: [
        {
          icon: <ComputerIcon />,
          label: "Name & headline",
          description: "Name, headline, availability, location, email",
          onClick: () => editors.editProfile("identity"),
        },
        {
          icon: <PictureIcon />,
          label: "Photos",
          description: "Profile picture and cover banner",
          onClick: () => editors.editProfile("photos"),
        },
        {
          icon: <NotepadIcon />,
          label: "Bio",
          description: "The text next to your photo on Home",
          onClick: () => editors.editProfile("about"),
        },
        {
          icon: <CheckIcon />,
          label: "Skills",
          description: "Your stack, optionally grouped",
          onClick: () => editors.editProfile("skills"),
        },
        {
          icon: <PdfIcon />,
          label: "Resume",
          description: "Upload a PDF or link to one",
          onClick: () => editors.editProfile("resume"),
        },
        {
          icon: <GlobeIcon />,
          label: "Account links",
          description: "GitHub, LinkedIn, Behance...",
          onClick: editors.editLinks,
        },
      ],
    },
    {
      title: "Content",
      applets: [
        {
          icon: <FolderIcon />,
          label: "New project",
          description: "Website, app or graphic design work",
          onClick: () => editors.editProject(null),
        },
        {
          icon: <ShopIcon />,
          label: "New product",
          description: "Shown under your bio on Home",
          onClick: () => editors.editProduct(null),
        },
        {
          icon: <ComputerIcon />,
          label: "Add experience",
          description: "Jobs, internships, volunteering",
          onClick: () => editors.editTimeline("experience", null),
        },
        {
          icon: <NotepadIcon />,
          label: "Add education",
          description: "Schools and programs",
          onClick: () => editors.editTimeline("education", null),
        },
        {
          icon: <CertificateIcon />,
          label: "Add achievement",
          description: "Certifications and awards",
          onClick: () => editors.editTimeline("achievement", null),
        },
      ],
    },
    {
      title: "System",
      applets: [
        {
          icon: <ComputerIcon />,
          label: "Display",
          description: "Wallpaper and light / dark theme",
          onClick: editors.editDisplay,
        },
        { icon: <InboxIcon />, label: "Inbox", description: "Messages from the contact form", to: "/inbox" },
        {
          icon: <span className="flex size-8 items-center justify-center text-2xl">✎</span>,
          label: editing ? "Edit mode: On" : "Edit mode: Off",
          description: editing ? "Turn off to see the site as visitors do" : "Turn on to show the edit buttons",
          onClick: toggle,
        },
      ],
    },
  ];

  return (
    <AppWindow title="Control Panel" status={["Only you can see this window"]}>
      <PageHeader
        eyebrow="Owner"
        title="Control Panel"
        intro="Everything on the site can be changed from here, or with the edit buttons in each window."
      />
      <div className="flex flex-col gap-10">
        {groups.map((g) => (
          <section key={g.title} aria-labelledby={`cp-${g.title}`}>
            <h2 id={`cp-${g.title}`} className="eyebrow mb-4">
              {g.title}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.applets.map((a, i) => {
                const inner = (
                  <>
                    <span className="transition-transform duration-200 group-hover:scale-110">{a.icon}</span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[16px] font-semibold">{a.label}</span>
                      <span className="text-[14px] text-muted">{a.description}</span>
                    </span>
                  </>
                );
                const cls = "lift group win-raised flex h-full w-full cursor-pointer items-center gap-4 p-4 text-left";
                return (
                  <li key={a.label} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    {a.to ? (
                      <Link to={a.to} className={cls}>
                        {inner}
                      </Link>
                    ) : (
                      <button type="button" onClick={a.onClick} className={cls}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </AppWindow>
  );
}
