"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService, OrderListParams } from "@/lib/api/orders";
import { OrderStatus } from "@/constants/order-status";
import { useAuth } from "@/stores/auth-store";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

/**
 * useOrders: Encapsulates order fetching and management logic using TanStack Query.
 * Mandated by FRONT-002 §8.2 for Modular Logic and Caching.
 *
 * D1 fix: userId is sourced internally from AuthContext — callers do NOT pass it.
 */
export function useOrders(params?: OrderListParams) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersService.list(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,          // 30 seconds
    refetchInterval: 60 * 1000,    // Auto-refresh every 60 s for live pipeline
  });

  const { data: stats } = useQuery({
    queryKey: ["order-stats"],
    queryFn: () => ordersService.getStats(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const statusMutation = useMutation({
    mutationFn: (variables: { id: number; newStatus: OrderStatus; changedByUserId: string; machineIds?: number[] }) =>
      ordersService.updateStatus(variables.id, {
        newStatus: variables.newStatus,
        changedByUserId: variables.changedByUserId,
        machineIds: variables.machineIds,
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const previousOrders = queryClient.getQueryData(["orders", params]);

      if (previousOrders) {
        queryClient.setQueryData(["orders", params], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((order: any) =>
              order.id === variables.id
                ? { 
                    ...order, 
                    currentStatus: variables.newStatus,
                    machineIds: variables.machineIds || order.machineIds 
                  }
                : order
            ),
          };
        });
      }

      return { previousOrders };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders", params], context.previousOrders);
      }
      
      // If there's a conflict (e.g. machine assignment failed), refresh the machines list
      if (err.status === 409) {
        queryClient.invalidateQueries({ queryKey: ["machines"] });
      }

      const isServerError = err.status >= 500;
      const errorMessage = isServerError 
        ? UI_LABELS.feedback.error.GENERIC 
        : (err.message || UI_LABELS.feedback.error.GENERIC);
        
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
    },
    onSuccess: () => {
      toast.success(UI_LABELS.feedback.success.ORDER_UPDATED);
    }
  });

  /**
   * Advances an order to the next process stage.
   * userId is pulled from AuthContext (D1 — no prop drilling).
   */
  const advanceOrder = async (orderId: number, nextStatus: OrderStatus, machineIds?: number[]) => {
    if (!user?.userId) {
      toast.error(UI_LABELS.feedback.error.AUTH_REQUIRED);
      return;
    }
    statusMutation.mutate({ id: orderId, newStatus: nextStatus, changedByUserId: user.userId, machineIds });
  };

  return {
    orders: data?.content ?? [],
    stats,
    loading,
    error: isError ? (error as any).message : null,
    pagination: {
      page: data?.page ?? 0,
      size: data?.size ?? 10,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    },
    refresh,
    advanceOrder,
  };
}

