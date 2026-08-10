"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/lib/api/orders";

/**
 * Custom hook to fetch and compute machine IDs currently in active use (WASHING or DRYING stages).
 */
export function useActiveMachineIds(): Set<string> {
  const { data: activeOrdersData } = useQuery({
    queryKey: ["active-orders-machines"],
    queryFn: () => ordersService.list({ size: 50 }),
    staleTime: 30 * 1000,
  });

  return React.useMemo(() => {
    const busy = new Set<string>();
    const activeOrders = activeOrdersData?.content ?? [];
    activeOrders.forEach((o: any) => {
      if (o.currentStatus === "WASHING" || o.currentStatus === "DRYING") {
        o.machineIds?.forEach((id: string) => busy.add(id));
      }
    });
    return busy;
  }, [activeOrdersData]);
}
