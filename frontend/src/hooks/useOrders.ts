"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService, OrderListParams } from "@/services/orders.service";
import { OrderStatus } from "@/constants/order-status";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    mutationFn: (variables: { id: number; newStatus: OrderStatus; changedByUserId: string }) =>
      ordersService.updateStatus(variables.id, {
        newStatus: variables.newStatus,
        changedByUserId: variables.changedByUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Order status updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  });

  /**
   * Advances an order to the next process stage.
   * userId is pulled from AuthContext (D1 — no prop drilling).
   */
  const advanceOrder = async (orderId: number, nextStatus: OrderStatus) => {
    if (!user?.userId) {
      toast.error("You must be logged in to advance an order.");
      return;
    }
    statusMutation.mutate({ id: orderId, newStatus: nextStatus, changedByUserId: user.userId });
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

