"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogService, AuditLogParams } from "@/services/audit-log.service";

/**
 * useAuditLog: Hook for the system audit log.
 * Enhanced with full sorting and filtering support.
 */
export function useAuditLog(params: AuditLogParams = { page: 0, size: 20 }) {
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditLogService.list(params),
    staleTime: 30 * 1000, // 30 seconds for live audit logs
  });

  return {
    data,
    logs: data?.content ?? [],
    loading,
    error: isError ? (error as any).message : null,
    pagination: {
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    },
    refresh: refetch,
  };
}

