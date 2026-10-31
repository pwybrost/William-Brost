export type Role = "admin" | "user";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  /**
   * true when this account's email equals the server's ADMIN_EMAIL.
   * Missing on old backend versions (used to explain why owner tools are hidden).
   */
  ownerEmailMatches?: boolean;
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
  /** e.g. "Open to internships"; empty hides the badge */
  availability: string;
  avatarMediaId: string | null;
  coverMediaId: string | null;
  /** custom desktop wallpaper; null = the built-in hills wallpaper */
  wallpaperMediaId: string | null;
  /** uploaded resume PDF */
  resumeMediaId: string | null;
  updatedAt: string;
}

export type ProjectCategory = "graphic_design" | "website" | "app" | "other";
export type ProjectStatus = "completed" | "in_progress" | "concept";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  graphic_design: "Graphic Design",
  website: "Website",
  app: "App",
  other: "Other",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  concept: "Concept",
};

export interface ProjectImage {
  id?: string;
  mediaId: string;
  caption: string;
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
  category: ProjectCategory;
  /** your role on the project, e.g. "Designer & developer" */
  role: string;
  year: string;
  status: ProjectStatus;
  /** false = draft, only the owner can see it */
  published: boolean;
  /** case-study sections, all optional */
  problem: string;
  process: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
  links: Link[];
  images: ProjectImage[];
}

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export type TimelineKind = "experience" | "education" | "achievement";

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
  achievements: TimelineEntry[];
  products: Product[];
}

export type ProductStatus = "available" | "coming_soon" | "sold_out";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  available: "Available",
  coming_soon: "Coming soon",
  sold_out: "Sold out",
};

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: string;
  url: string;
  mediaId: string | null;
  status: ProductStatus;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt">;

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageInput {
  name: string;
  email: string;
  subject: string;
  body: string;
  /** honeypot, must stay empty */
  website: string;
}
