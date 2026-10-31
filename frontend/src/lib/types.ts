export type Role = "admin" | "user";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface Link {
  id?: string;
  label: string;
  url: string;
}

export interface Profile {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  contactEmail: string;
  resumeUrl: string;
  skills: string[];
  avatarMediaId: string | null;
  coverMediaId: string | null;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  techStack: string[];
  coverMediaId: string | null;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  links: Link[];
}

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export type TimelineKind = "experience" | "education";

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  sortOrder: number;
}

export type TimelineInput = Omit<TimelineEntry, "id">;

export interface Portfolio {
  profile: Profile;
  socialLinks: Link[];
  projects: Project[];
  experience: TimelineEntry[];
  education: TimelineEntry[];
}
