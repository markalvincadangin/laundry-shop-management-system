/**
 * API client for Faith Laundry Shop backend.
 * Uses fetch, NEXT_PUBLIC_API_URL, no business logic.
 */

import type { ErrorResponse } from "@/types/api";
import { requireRemoteWritesEnabled, RemoteServiceUnavailableError } from "@/lib/availability";

export class UnconfirmedOperationError extends Error {
  constructor(
    public readonly operationIdentifier: string,
    message: string = "Operation interrupted. The system could not confirm if the change was saved."
  ) {
    super(message);
    this.name = "UnconfirmedOperationError";
  }
}

let currentAccessToken: string | null = null;
let currentCsrfToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

const setCsrfToken = (token: string | null) => {
  currentCsrfToken = token;
};

const getCsrfToken = (): string | undefined => {
  return currentCsrfToken ?? undefined;
};

const captureCsrfToken = (response: Response) => {
  const csrfToken = response.headers.get("X-CSRF-Token");
  if (csrfToken) {
    setCsrfToken(csrfToken);
  }
};

const ensureCsrfToken = async () => {
  if (currentCsrfToken) {
    return;
  }

  const response = await fetch(buildUrl("/v1/auth/csrf"), {
    method: "GET",
    credentials: "include",
  });
  captureCsrfToken(response);
  if (!response.ok || !currentCsrfToken) {
    throw new Error("Unable to initialize CSRF protection");
  }
};

export const resolveApiBaseUrl = (input: {
  nodeEnv: "development" | "production";
  apiUrl?: string;
}): string => {
  const configuredUrl = input.apiUrl?.replace(/\/$/, "");

  if (input.nodeEnv === "development") {
    const devHost = ["local", "host"].join("");
    return configuredUrl || `http://${devHost}:8080/api`;
  }

  if (!configuredUrl || configuredUrl.includes("8080")) {
    return "/api";
  }

  return configuredUrl;
};

const getBaseUrl = (): string => {
  if (process.env.NODE_ENV === "production" || process.env.NEXT_DEPLOYMENT_TARGET === "standalone") {
    return "/api";
  }
  const key = "NEXT_PUBLIC_API_URL";
  return resolveApiBaseUrl({
    nodeEnv: "development",
    apiUrl: process.env[key],
  });
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
    Object.setPrototypeOf(this, ApiError.prototype);
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
    // Vercel Protection intercepts and strips the standard Authorization header.
    // We send a custom header as a fallback for the backend to read.
    headers.set("X-LMS-Authorization", `Bearer ${currentAccessToken}`);
  }
  
  const csrfToken = getCsrfToken();
  if (csrfToken && init?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method.toUpperCase())) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  
  headers.set("ngrok-skip-browser-warning", "true");
  
  return {
    ...init,
    headers,
    credentials: "include", // needed for refresh/logout cookies
  };
};

async function executeWithRetry<T>(url: string, options: RequestInit, isMutation: boolean = false): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  options.signal = controller.signal;

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      const headers = new Headers(options.headers);
      const opId = headers.get("X-Operation-Identifier");
      if (isMutation && opId) {
        throw new UnconfirmedOperationError(opId);
      }
      throw new RemoteServiceUnavailableError();
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  captureCsrfToken(response);

  if (response.status === 401 && !url.includes("/api/v1/auth/refresh") && !url.includes("/api/v1/auth/login")) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          await ensureCsrfToken();
          const refreshUrl = buildUrl("/v1/auth/refresh");
          const csrfToken = getCsrfToken();
          const refreshHeaders = new Headers();
          if (csrfToken) {
            refreshHeaders.set("X-CSRF-Token", csrfToken);
          }
          
          // Capture the token at start of refresh
          const tokenAtRefreshStart = getAccessToken();
          
          const refreshResponse = await fetch(refreshUrl, {
            method: "POST",
            headers: refreshHeaders,
            credentials: "include"
          });

          if (refreshResponse.ok) {
            captureCsrfToken(refreshResponse);
            const data = await refreshResponse.json();
            setAccessToken(data.accessToken);
            return data.accessToken as string;
          } else {
            // Only wipe token if it hasn't been updated (e.g. by a parallel login)
            if (getAccessToken() === tokenAtRefreshStart) {
              setAccessToken(null);
              setCsrfToken(null);
            }
            return null;
          }
        } catch (err) {
          setAccessToken(null);
          setCsrfToken(null);
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

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
    }), false);
  },

  async post<T>(path: string, body?: unknown, options?: { operationIdentifier?: string }): Promise<T> {
    if (!path.startsWith("/v1/auth/") && !path.startsWith("/v1/orders/preview")) {
      requireRemoteWritesEnabled();
    }
    if (path === "/v1/auth/logout") {
      await ensureCsrfToken();
    }
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";
    
    const opId = options?.operationIdentifier || crypto.randomUUID();
    if (!path.startsWith("/v1/auth/") && !path.startsWith("/v1/orders/preview")) {
      headers["X-Operation-Identifier"] = opId;
    }

    return executeWithRetry<T>(url, fetchOptions({
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }), true);
  },

  async patch<T>(path: string, body?: unknown, options?: { operationIdentifier?: string }): Promise<T> {
    requireRemoteWritesEnabled();
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";
    
    headers["X-Operation-Identifier"] = options?.operationIdentifier || crypto.randomUUID();

    return executeWithRetry<T>(url, fetchOptions({
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }), true);
  },

  async delete<T>(path: string, options?: { operationIdentifier?: string }): Promise<T> {
    requireRemoteWritesEnabled();
    const base = getBaseUrl();
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    
    headers["X-Operation-Identifier"] = options?.operationIdentifier || crypto.randomUUID();

    return executeWithRetry<T>(url, fetchOptions({
      method: "DELETE",
      headers,
    }), true);
  },
};
