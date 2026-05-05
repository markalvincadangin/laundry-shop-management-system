"use client";

import React from "react";
import { ChevronRight, Clock, PlayCircle } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { StatusBadge, Button } from "@/components/ui";
import { DataTable, EmptyState } from "@/components/features/shared";
import { calculateEstimatedTime } from "@/lib/utils";
import { DataTableColumn } from "@/types/components";
import { OrderResponse } from "@/services/orders.service";
import { STATUS_TRANSITIONS, OrderStatus } from "@/constants/order-status";
import { UI_LABELS } from "@/constants/ui";

/**
 * Order Queue Table (Dashboard Version)
 * Rebuilt using the Universal DataTable engine.
 * Adheres to FRONT-001 §12.2 and FRONT-002 §8.1.
 */
export function OrderQueueTable() {
  const { orders, loading, advanceOrder } = useOrders({
    status: undefined, // All active statuses
    size: 5
  });

  const activeOrders = orders.filter(o =>
    !["RELEASED", "CANCELLED"].includes(o.currentStatus ?? "")
  );

  const columns: DataTableColumn<OrderResponse>[] = [
    {
      header: UI_LABELS.shared.common.ORDER_NUMBER,
      render: (o) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 font-mono">{o.referenceNumber}</span>
            {(o.serviceType?.includes("RUSH") || o.serviceName?.includes("Rush")) && (
              <StatusBadge label="RUSH" variant="rush" className="px-1.5 py-0.5 text-[8px]" />
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">ID: {o.customerId}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      render: (o) => <StatusBadge status={o.currentStatus as any} />,
    },
    {
      header: UI_LABELS.modules.dashboard.ESTIMATED_TIME,
      render: (o) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-medium">
            {calculateEstimatedTime(o.totalLoads, o.extraMinutes)}
          </span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.ACTIONS,
      align: "right",
      render: (o) => {
        const transition = STATUS_TRANSITIONS[o.currentStatus as OrderStatus];
        if (!transition || (transition.next === "RELEASED" && o.paymentStatus !== "PAID")) {
          return null;
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              advanceOrder(o.id!, transition.next);
            }}
            className="h-9 px-4 gap-2 text-brand-blue hover:bg-brand-blue/5 border border-transparent hover:border-brand-blue/10 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <PlayCircle className="h-4 w-4" />
            {transition.label}
          </Button>
        );
      },
    }
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={activeOrders}
        columns={columns}
        loading={loading}
        density="compact"
        isStickyHeader
        maxHeight="420px"
        onRowClick={(o) => window.location.href = `/orders/${o.id}`}
        emptyState={
          <EmptyState
            title={UI_LABELS.feedback.empty.ORDERS_TITLE}
            description={UI_LABELS.feedback.empty.ORDERS_DESC}
          />
        }
      />
    </div>
  );
}
