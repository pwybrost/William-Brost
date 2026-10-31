/** Converts snake_case database rows into the camelCase JSON the frontend uses. */

export const PROJECT_CATEGORIES = ["graphic_design", "website", "app", "other"] as const;
export const PROJECT_STATUSES = ["completed", "in_progress", "concept"] as const;
export const TIMELINE_KINDS = ["experience", "education", "achievement"] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type TimelineKind = (typeof TIMELINE_KINDS)[number];

export interface ProfileRow {
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  contact_email: string;
  resume_url: string;
  skills: string[];
  availability: string;
  avatar_media_id: string | null;
  cover_media_id: string | null;
  updated_at: Date;
}

export interface LinkRow {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

export interface ProjectRow {
  id: string;
  title: string;
  summary: string;
  description: string;
  tech_stack: string[];
  cover_media_id: string | null;
  featured: boolean;
  sort_order: number;
  category: ProjectCategory;
  role: string;
  year: string;
  status: ProjectStatus;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectLinkRow extends LinkRow {
  project_id: string;
}

export interface ProjectImageRow {
  id: string;
  project_id: string;
  media_id: string;
  caption: string;
  sort_order: number;
}

export interface TimelineRow {
  id: string;
  kind: TimelineKind;
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  sort_order: number;
}

export interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: Date;
}

export const toProfile = (r: ProfileRow) => ({
  fullName: r.full_name,
  headline: r.headline,
  bio: r.bio,
  location: r.location,
  contactEmail: r.contact_email,
  resumeUrl: r.resume_url,
  skills: r.skills,
  availability: r.availability,
  avatarMediaId: r.avatar_media_id,
  coverMediaId: r.cover_media_id,
  updatedAt: r.updated_at,
});

export const toLink = (r: LinkRow) => ({ id: r.id, label: r.label, url: r.url });

export const toImage = (r: ProjectImageRow) => ({ id: r.id, mediaId: r.media_id, caption: r.caption });

export const toProject = (r: ProjectRow, links: ProjectLinkRow[], images: ProjectImageRow[]) => ({
  id: r.id,
  title: r.title,
  summary: r.summary,
  description: r.description,
  techStack: r.tech_stack,
  coverMediaId: r.cover_media_id,
  featured: r.featured,
  sortOrder: r.sort_order,
  category: r.category,
  role: r.role,
  year: r.year,
  status: r.status,
  published: r.published,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  links: links.filter((l) => l.project_id === r.id).map(toLink),
  images: images.filter((i) => i.project_id === r.id).map(toImage),
});

export const toTimeline = (r: TimelineRow) => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  organization: r.organization,
  location: r.location,
  startDate: r.start_date,
  endDate: r.end_date,
  description: r.description,
  sortOrder: r.sort_order,
});

export const toMessage = (r: MessageRow) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  subject: r.subject,
  body: r.body,
  isRead: r.is_read,
  createdAt: r.created_at,
});
