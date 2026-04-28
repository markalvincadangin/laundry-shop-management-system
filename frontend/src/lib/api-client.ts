/**
 * API client for Faith Laundry Shop backend.
 * Uses fetch, NEXT_PUBLIC_API_URL, no business logic.
 */

import type { ErrorResponse } from "@/types/api";

const getBaseUrl = (): string => {
  // In the browser, we use a relative path so the request is proxied by Next.js
  if (typeof window !== "undefined") {
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

const fetchOptions = (init?: RequestInit): RequestInit => ({
  ...init,
  credentials: "include",
});

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
    const response = await fetch(url, fetchOptions({
      method: "GET",
      headers: { Accept: "application/json" },
    }));
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";

    const response = await fetch(url, fetchOptions({
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }));
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";

    const response = await fetch(url, fetchOptions({
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }));
    return handleResponse<T>(response);
  },
};
