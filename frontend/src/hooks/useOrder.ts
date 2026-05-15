"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";

/**
 * useOrder: Fetches full details for a specific order.
 * Mandated by FRONT-002 Strategy 1 for logic extraction.
 */
export function useOrder(orderId: number) {
  const {
    data: order,
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => ordersService.getById(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    order,
    loading,
    error: isError ? (error as any).message : null,
    refresh,
  };
}

