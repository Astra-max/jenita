const TOKEN_KEY = "jenita_auth_token";

export const geminiWSURL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
export const modelID = "models/gemini-2.5-flash-native-audio-latest";

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export type TaskStatus = "pending" | "confirmed" | "done";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  time: string;
  due_date: string;
  meta: string;
  status: TaskStatus;
  priority: "low" | "normal" | "high" | "urgent";
  recurrence?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

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
    const token = getToken();
    const separator = base.includes("?") ? "&" : "?";

    if (base.includes("generativelanguage.googleapis.com")) {
      const modelParam = `model=${encodeURIComponent(modelID)}`;
      const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
      return `${base}${separator}${modelParam}${tokenParam}`;
    }

    const query = token ? `${separator}token=${encodeURIComponent(token)}` : "";
    return `${base}${path}${query}`;
  }

  if (typeof window === "undefined") {
    return `wss://jenita-server.onrender.com${path}`;
  }

  const token = getToken();
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";

  if (window.location.hostname === "localhost") {
    return `ws://localhost:8080${path}${tokenQuery}`;
  }

  return `wss://jenita-server.onrender.com${path}${tokenQuery}`;
}

function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_GEMINI_LIVE_WS_URL || "";
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window === "undefined") return "https://jenita-server.onrender.com";
  if (window.location.hostname === "localhost") {
    return "http://localhost:8080";
  }
  return "https://jenita-server.onrender.com";
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const requestHeaders = options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : typeof options.headers === "object" && options.headers !== null
      ? (options.headers as Record<string, string>)
      : {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...requestHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const base = getApiBase();
  const fullUrl = endpoint.startsWith("http") ? endpoint : `${base}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string; message?: string };
      if (data.error) errorMsg = data.error;
      else if (data.message) errorMsg = data.message;
    } catch {
      // Ignore JSON parse error on non-json response
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

// Typed API services
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: { email: string; password: string; full_name: string }) =>
    apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => apiFetch<User>("/api/v1/auth/me"),
};

export const tasksApi = {
  list: (date?: string) => {
    const q = date ? `?date=${encodeURIComponent(date)}` : "";
    return apiFetch<Task[]>(`/api/v1/tasks${q}`);
  },
  create: (data: { title: string; time: string; due_date?: string; meta?: string; priority?: string }) =>
    apiFetch<Task>("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<Task>(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<Task>(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    }),
  updateStatus: (id: string, status: TaskStatus) =>
    apiFetch<Task>(`/api/v1/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  snooze: (id: string, minutes: number = 15) =>
    apiFetch<Task>(`/api/v1/tasks/${id}/snooze`, {
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
    apiFetch<Record<string, unknown>>("/api/v1/reminders/trigger-test", {
      method: "POST",
      body: JSON.stringify({ task_id: taskId || "" }),
    }),
  getActive: () => apiFetch<Array<Record<string, unknown>>>("/api/v1/reminders/active"),
  confirm: (id: string) =>
    apiFetch<Record<string, unknown>>(`/api/v1/reminders/${id}/confirm`, {
      method: "POST",
    }),
  snooze: (id: string, minutes: number = 15) =>
    apiFetch<Record<string, unknown>>(`/api/v1/reminders/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify({ minutes }),
    }),
};

export const preferencesApi = {
  get: () => apiFetch<Record<string, unknown>>("/api/v1/preferences"),
  update: (data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>("/api/v1/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
