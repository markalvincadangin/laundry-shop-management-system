import { apiClient } from "@/lib/api-client";
import { UserRole, components } from "@/types";

export type UserStatsResponse = components["schemas"]["UserStatsResponse"];

export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  password?: string;
}

export const usersService = {
  getAll: (params?: any) => apiClient.get<any>("/v1/users", { params }),
  getStats: () => apiClient.get<UserStatsResponse>("/v1/users/stats"),
  create: (data: CreateUserRequest, options?: { operationIdentifier?: string }) => apiClient.post<UserResponse>("/v1/users", data, options),
  update: (id: string, data: UpdateUserRequest, options?: { operationIdentifier?: string }) => apiClient.patch<UserResponse>(`/v1/users/${id}`, data, options),
  toggleStatus: (id: string, options?: { operationIdentifier?: string }) => apiClient.patch(`/v1/users/${id}/toggle-status`, {}, options),
};
