/** Converts snake_case database rows into the camelCase JSON the frontend uses. */

export interface ProfileRow {
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  contact_email: string;
  resume_url: string;
  skills: string[];
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
  created_at: Date;
  updated_at: Date;
}

export interface ProjectLinkRow extends LinkRow {
  project_id: string;
}

export interface TimelineRow {
  id: string;
  kind: "experience" | "education";
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  sort_order: number;
}

export const toProfile = (r: ProfileRow) => ({
  fullName: r.full_name,
  headline: r.headline,
  bio: r.bio,
  location: r.location,
  contactEmail: r.contact_email,
  resumeUrl: r.resume_url,
  skills: r.skills,
  avatarMediaId: r.avatar_media_id,
  coverMediaId: r.cover_media_id,
  updatedAt: r.updated_at,
});

export const toLink = (r: LinkRow) => ({ id: r.id, label: r.label, url: r.url });

export const toProject = (r: ProjectRow, links: ProjectLinkRow[]) => ({
  id: r.id,
  title: r.title,
  summary: r.summary,
  description: r.description,
  techStack: r.tech_stack,
  coverMediaId: r.cover_media_id,
  featured: r.featured,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  links: links.filter((l) => l.project_id === r.id).map(toLink),
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
