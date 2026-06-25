import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type LoginRequest = components["schemas"]["LoginRequest"];
export type LoginResponse = components["schemas"]["LoginResponse"];

export const USER_ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
} as const;

export type CurrentUserResponse = {
  userId: string;
  username: string;
  role: "ADMIN" | "STAFF";
};

/**
 * authService: Authoritative layer for authentication API interactions.
 * Mandated by FRONT-002 §8.2.
 */
export const authService = {
  /** Submits credentials and returns a session token/response */
  async login(body: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/v1/auth/login", body);
    return response;
  },

  /** Terminates the user session */
  async logout(): Promise<void> {
    await apiClient.post<void>("/v1/auth/logout", {});
  },

  /** Retrieves the currently authenticated user's profile */
  async me(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>("/v1/auth/me");
    return response;
  },
};
