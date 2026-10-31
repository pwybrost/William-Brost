import type {
  Link,
  Message,
  MessageInput,
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

export const mediaUrl = (id: string | null | undefined) => (id ? `${API_BASE}/api/media/${id}` : null);

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
  /** Uploads an image. `onProgress` gets 0-100 (fetch can't report upload progress, so this uses XHR). */
  uploadImage: (file: File, onProgress?: (percent: number) => void) =>
    new Promise<{ id: string }>((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/api/media`);
      xhr.withCredentials = true; // send the session cookie
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100);
      };
      xhr.onload = () => {
        let data: { id?: string; error?: string; details?: Record<string, string[] | undefined> } = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          /* non-JSON response */
        }
        if (xhr.status >= 200 && xhr.status < 300 && data.id) {
          onProgress?.(100);
          resolve({ id: data.id });
        } else {
          reject(new ApiError(xhr.status, data.error ?? `Upload failed (${xhr.status})`, data.details));
        }
      };
      xhr.onerror = () => reject(new ApiError(0, "Network error while uploading"));
      xhr.send(form);
    }),
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
  createTimeline: (e: TimelineInput) => request<{ entry: TimelineEntry }>("/api/timeline", { method: "POST", json: e }),
  updateTimeline: (id: string, e: TimelineInput) =>
    request<{ entry: TimelineEntry }>(`/api/timeline/${id}`, { method: "PUT", json: e }),
  deleteTimeline: (id: string) => request<void>(`/api/timeline/${id}`, { method: "DELETE" }),

  // contact form (anyone) + inbox (owner only)
  sendMessage: (m: MessageInput) => request<{ ok: true }>("/api/messages", { method: "POST", json: m }),
  messages: () => request<{ messages: Message[]; unread: number }>("/api/messages"),
  unreadCount: () => request<{ unread: number }>("/api/messages/unread-count"),
  markMessage: (id: string, isRead: boolean) =>
    request<{ message: Message }>(`/api/messages/${id}`, { method: "PATCH", json: { isRead } }),
  deleteMessage: (id: string) => request<void>(`/api/messages/${id}`, { method: "DELETE" }),
};

/** The API only wants the editable fields of links and gallery images. */
function stripLinkIds(p: ProjectInput) {
  return {
    ...p,
    links: p.links.map(({ label, url }) => ({ label, url })),
    images: p.images.map(({ mediaId, caption }) => ({ mediaId, caption })),
  };
}
