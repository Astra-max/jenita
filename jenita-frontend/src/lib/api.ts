const TOKEN_KEY = "jenita_auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getWebSocketURL(path: string = "/api/v1/ws/live"): string {
  const configuredBase = process.env.NEXT_PUBLIC_GEMINI_LIVE_WS_URL || process.env.NEXT_PUBLIC_WS_URL || "";

  if (configuredBase) {
    const base = configuredBase.replace(/\/$/, "");
    const query = getToken() ? `?token=${encodeURIComponent(getToken() as string)}` : "";
    return `${base}${path}${query}`;
  }

  if (typeof window === "undefined") return `ws://localhost:8080${path}`;

  const token = getToken();
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";

  const isHttps = window.location.protocol === "https:";
  const protocol = isHttps ? "wss:" : "ws:";
  const host = window.location.hostname === "localhost" ? "localhost:8080" : window.location.host;

  return `${protocol}//${host}${path}${tokenQuery}`;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Rewrite /api/v1 will be proxied by Next.js or direct
  const url = endpoint.startsWith("http") ? endpoint : endpoint;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
      else if (data.message) errorMsg = data.message;
    } catch {
      // Ignore JSON parse error on non-json response
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// Typed API services
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: any }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: { email: string; password: string; full_name: string }) =>
    apiFetch<{ token: string; user: any }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => apiFetch<any>("/api/v1/auth/me"),
};

export const tasksApi = {
  list: (date?: string) => {
    const q = date ? `?date=${encodeURIComponent(date)}` : "";
    return apiFetch<any[]>(`/api/v1/tasks${q}`);
  },
  create: (data: { title: string; time: string; due_date?: string; meta?: string; priority?: string }) =>
    apiFetch<any>("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<any>(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    }),
  updateStatus: (id: string, status: "pending" | "confirmed" | "done") =>
    apiFetch<any>(`/api/v1/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  snooze: (id: string, minutes: number = 15) =>
    apiFetch<any>(`/api/v1/tasks/${id}/snooze`, {
      method: "PATCH",
      body: JSON.stringify({ minutes }),
    }),
  getStats: (date?: string) => {
    const q = date ? `?date=${encodeURIComponent(date)}` : "";
    return apiFetch<{
      completed_count: number;
      total_count: number;
      focus_hours_left: string;
      next_reminder_title: string;
      next_reminder_time: string;
    }>(`/api/v1/tasks/stats${q}`);
  },
};

export const remindersApi = {
  triggerTest: (taskId?: string) =>
    apiFetch<any>("/api/v1/reminders/trigger-test", {
      method: "POST",
      body: JSON.stringify({ task_id: taskId || "" }),
    }),
  getActive: () => apiFetch<any[]>("/api/v1/reminders/active"),
  confirm: (id: string) =>
    apiFetch<any>(`/api/v1/reminders/${id}/confirm`, {
      method: "POST",
    }),
  snooze: (id: string, minutes: number = 15) =>
    apiFetch<any>(`/api/v1/reminders/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify({ minutes }),
    }),
};

export const preferencesApi = {
  get: () => apiFetch<any>("/api/v1/preferences"),
  update: (data: any) =>
    apiFetch<any>("/api/v1/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
