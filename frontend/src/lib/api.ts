import type {
  Link,
  Portfolio,
  Profile,
  Project,
  ProjectInput,
  TimelineEntry,
  TimelineInput,
  User,
} from "./types";

/** Empty in dev (Vite proxies /api). Set VITE_API_URL in production. */
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; json?: unknown; form?: FormData } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
    credentials: "include", // send the session cookie
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.details);
  }
  return data as T;
}

/** Turns a validation error into one readable line, e.g. "url: Must be a valid URL". */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const fields = err.details
      ? Object.entries(err.details)
          .filter(([, msgs]) => msgs?.length)
          .map(([field, msgs]) => `${field}: ${msgs![0]}`)
      : [];
    return fields.length ? `${err.message}. ${fields.join("; ")}` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export const mediaUrl = (id: string | null | undefined) =>
  id ? `${API_BASE}/api/media/${id}` : null;

export const api = {
  // auth
  me: () => request<{ user: User }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", { method: "POST", json: { email, password } }),
  signup: (displayName: string, email: string, password: string) =>
    request<{ user: User }>("/api/auth/signup", {
      method: "POST",
      json: { displayName, email, password },
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  // read
  portfolio: () => request<Portfolio>("/api/portfolio"),
  project: (id: string) => request<{ project: Project }>(`/api/projects/${id}`),

  // owner-only writes
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ id: string }>("/api/media", { method: "POST", form });
  },
  updateProfile: (p: Omit<Profile, "updatedAt">) =>
    request<{ profile: Profile }>("/api/profile", { method: "PUT", json: p }),
  updateSocialLinks: (links: Link[]) =>
    request<{ socialLinks: Link[] }>("/api/social-links", {
      method: "PUT",
      json: { links: links.map(({ label, url }) => ({ label, url })) },
    }),
  createProject: (p: ProjectInput) =>
    request<{ project: Project }>("/api/projects", { method: "POST", json: stripLinkIds(p) }),
  updateProject: (id: string, p: ProjectInput) =>
    request<{ project: Project }>(`/api/projects/${id}`, { method: "PUT", json: stripLinkIds(p) }),
  deleteProject: (id: string) => request<void>(`/api/projects/${id}`, { method: "DELETE" }),
  createTimeline: (e: TimelineInput) =>
    request<{ entry: TimelineEntry }>("/api/timeline", { method: "POST", json: e }),
  updateTimeline: (id: string, e: TimelineInput) =>
    request<{ entry: TimelineEntry }>(`/api/timeline/${id}`, { method: "PUT", json: e }),
  deleteTimeline: (id: string) => request<void>(`/api/timeline/${id}`, { method: "DELETE" }),
};

function stripLinkIds(p: ProjectInput) {
  return { ...p, links: p.links.map(({ label, url }) => ({ label, url })) };
}
