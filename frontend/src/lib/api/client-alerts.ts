import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";
import type { PageResponse } from "@/types/api";

export type ClientAlertResponse = components["schemas"]["ClientAlertResponse"];

export interface ClientAlertParams {
  page?: number;
  size?: number;
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

/**
 * Client Alerts Service: Registry for all customer communication logs.
 * Institutionalized to Faith Laundry Counter standards.
 */
export const clientAlertsService = {
  /** Retrieves client alert logs with pagination and filtering */
  async list(params?: ClientAlertParams): Promise<PageResponse<ClientAlertResponse>> {
    return apiClient.get<PageResponse<ClientAlertResponse>>("/v1/client-alerts", { params: params as any });
  },

  /** Marks a specific alert as read */
  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/v1/client-alerts/${id}/read`);
  },

  /** Marks all unread alerts as read */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/v1/client-alerts/read-all");
  },
};
