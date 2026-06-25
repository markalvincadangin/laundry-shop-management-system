import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";
import type { PageResponse } from "@/types/api";

export type AuditLogResponse = components["schemas"]["AuditLogResponse"];

export interface AuditLogParams {
  page?: number;
  size?: number;
  [key: string]: any;
}

/**
 * Audit Log Service: Interface for the unified system audit log.
 */
export const auditLogService = {
  /** Retrieves system audit logs with pagination */
  async list(params?: AuditLogParams): Promise<PageResponse<AuditLogResponse>> {
    return apiClient.get<PageResponse<AuditLogResponse>>("/v1/audit-logs", { params });
  },
};
