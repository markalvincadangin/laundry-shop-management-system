/**
 * API client for Faith Laundry Shop backend.
 * Uses fetch, NEXT_PUBLIC_API_URL, no business logic.
 */

import type { ErrorResponse } from "@/types/api";

let currentAccessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const getCsrfToken = (): string | undefined => {
  if (typeof document !== "undefined") {
    const match = document.cookie.split("; ").find(row => row.startsWith("csrf_token="));
    return match ? match.split("=")[1] : undefined;
  }
  return undefined;
};

const getBaseUrl = (): string => {
  // In the browser, we use a relative path so the request is proxied by Next.js
  if (typeof window !== "undefined") {
    // Since output: 'export' disables Next.js rewrites, we cannot proxy /api in development.
    // We must hit the backend directly (e.g., http://localhost:8080/api).
    if (process.env.NODE_ENV === "development") {
      return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    }
    return "/api";
  }

  // On the server (SSR/Server Actions), we use the internal Docker URL
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  return url.replace(/\/$/, ""); // trim trailing slash
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    let errorBody: ErrorResponse | null = null;
    if (isJson) {
      try {
        errorBody = (await response.json()) as ErrorResponse;
      } catch {
        // ignore parse errors
      }
    }
    throw new ApiError(
      response.status,
      errorBody?.code ?? "HTTP_ERROR",
      errorBody?.message ?? response.statusText,
      errorBody?.details
    );
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  if (!isJson) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const fetchOptions = (init?: RequestInit): RequestInit => {
  const headers = new Headers(init?.headers);
  if (currentAccessToken) {
    headers.set("Authorization", `Bearer ${currentAccessToken}`);
  }
  
  const csrfToken = getCsrfToken();
  if (csrfToken && init?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method.toUpperCase())) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  
  return {
    ...init,
    headers,
    credentials: "include", // needed for refresh/logout cookies
  };
};

async function executeWithRetry<T>(url: string, options: RequestInit): Promise<T> {
  let response = await fetch(url, options);

  if (response.status === 401 && !url.includes("/api/v1/auth/refresh") && !url.includes("/api/v1/auth/login")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshUrl = buildUrl("/api/v1/auth/refresh");
        const csrfToken = getCsrfToken();
        const refreshHeaders = new Headers();
        if (csrfToken) {
          refreshHeaders.set("X-CSRF-Token", csrfToken);
        }
        
        const refreshResponse = await fetch(refreshUrl, {
          method: "POST",
          headers: refreshHeaders,
          credentials: "include"
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAccessToken(data.token);
          onRefreshed(data.token);
        } else {
          // Refresh failed, user needs to login again
          setAccessToken(null);
          onRefreshed("");
        }
      } catch (err) {
        setAccessToken(null);
        onRefreshed("");
      } finally {
        isRefreshing = false;
      }
    }

    // Wait for refresh to complete, then retry
    const newToken = await new Promise<string>((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });

    if (newToken) {
      // Retry original request with new token
      const newHeaders = new Headers(options.headers);
      newHeaders.set("Authorization", `Bearer ${newToken}`);
      const retryOptions = { ...options, headers: newHeaders };
      response = await fetch(url, retryOptions);
    }
  }

  return handleResponse<T>(response);
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const base = getBaseUrl();
  let url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        search.set(k, String(v));
      }
    }
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

export const apiClient = {
  async get<T>(path: string, options?: { params?: Record<string, unknown> }): Promise<T> {
    const url = buildUrl(path, options?.params);
    return executeWithRetry<T>(url, fetchOptions({
      method: "GET",
      headers: { Accept: "application/json" },
    }));
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";

    return executeWithRetry<T>(url, fetchOptions({
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }));
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";

    return executeWithRetry<T>(url, fetchOptions({
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }));
  },

  async delete<T>(path: string): Promise<T> {
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };

    return executeWithRetry<T>(url, fetchOptions({
      method: "DELETE",
      headers,
    }));
  },
};
