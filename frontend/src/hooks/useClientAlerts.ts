"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientAlertsService, ClientAlertParams } from "@/lib/api/client-alerts";

/**
 * useClientAlerts: Encapsulates recent activity retrieval logic.
 * Enhanced with full pagination, filtering, and sorting support.
 */
export function useClientAlerts(params: ClientAlertParams = { page: 0, size: 15 }) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["client-alerts", params],
    queryFn: () => clientAlertsService.list(params),
    staleTime: 30 * 1000, // 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => clientAlertsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-alerts"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => clientAlertsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-alerts"] });
    },
  });

  return {
    data,
    alerts: data?.content ?? [],
    loading,
    error: isError ? (error as any).message : null,
    pagination: {
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    },
    refresh: refetch,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    isMarkingAsRead: markAsRead.isPending || markAllAsRead.isPending,
  };
}

