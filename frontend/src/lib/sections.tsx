import type { ReactNode } from "react";
import {
  CertificateIcon,
  CmdIcon,
  ComputerIcon,
  FolderIcon,
  GearIcon,
  InboxIcon,
  MailIcon,
  PdfIcon,
  PictureIcon,
} from "../components/win98/Icons";

export interface Section {
  path: string;
  /** short name for menus and desktop icons */
  label: string;
  Icon: (p: { size?: number; className?: string }) => ReactNode;
  /** only the owner sees it */
  owner?: boolean;
}

/** Every window of the site. The menu bar, Start menu and desktop icons are all built from this. */
export const SECTIONS: Section[] = [
  { path: "/", label: "Home", Icon: ComputerIcon },
  { path: "/projects", label: "Projects", Icon: FolderIcon },
  { path: "/gallery", label: "Gallery", Icon: PictureIcon },
  { path: "/journey", label: "Journey", Icon: CertificateIcon },
  { path: "/stack", label: "Stack", Icon: CmdIcon },
  { path: "/resume", label: "Resume", Icon: PdfIcon },
  { path: "/contact", label: "Contact", Icon: MailIcon },
  { path: "/control-panel", label: "Control Panel", Icon: GearIcon, owner: true },
  { path: "/inbox", label: "Inbox", Icon: InboxIcon, owner: true },
];

export const sectionFor = (path: string) =>
  SECTIONS.find((s) => s.path === path) ??
  SECTIONS.find((s) => s.path !== "/" && path.startsWith(`${s.path}/`)) ??
  SECTIONS[0];
