/**
 * Auth API module.
 */

import { apiClient } from "./client";
import type { components } from "@/types/api.generated";

export type LoginRequest = components["schemas"]["LoginRequest"];
export type LoginResponse = components["schemas"]["LoginResponse"];

export type CurrentUserResponse = {
  userId: string;
  username: string;
  role: "OWNER" | "STAFF";
};

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse>("/v1/auth/login", body),

  logout: () => apiClient.post<unknown>("/v1/auth/logout", {}),

  me: () => apiClient.get<CurrentUserResponse>("/v1/auth/me"),
};
