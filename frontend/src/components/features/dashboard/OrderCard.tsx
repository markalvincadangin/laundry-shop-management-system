"use client";

import React from "react";
import { ArrowRight, Clock, Scale } from "lucide-react";
import { Card, Button, StatusBadge } from "@/components/ui";
import { OrderResponse } from "@/services/orders.service";
import { STATUS_TRANSITIONS, OrderStatus } from "@/constants/order-status";
import { UI_LABELS } from "@/constants/ui";

interface OrderCardProps {
  order: OrderResponse;
  onAdvance: (orderId: number, nextStatus: OrderStatus) => void;
  isLoading?: boolean;
  /** When true, applies Urgent State left-border accent (§11.5 — Ready for Pickup column) */
  isUrgent?: boolean;
}

/**
 * OrderCard — High-density Kanban card for the Order Pipeline (v3.0).
 * FRONT-001 §11.2, §11.5.
 *
 * Changes from v2.x (D2):
 *  - ProcessStepper REMOVED — redundant inside a column that already represents a stage.
 *  - "ACTIVE" hardcoded label REMOVED — not from UI_LABELS.
 *  - isUrgent prop added: applies border-l-4 border-emerald-700 for Ready column.
 *  - Reference number: font-mono (JetBrains Mono via Tailwind alias).
 *  - Drop-off time rendered as relative timestamp from createdAt.
 *  - weightKg displayed alongside totalLoads.
 */
export function OrderCard({ order, onAdvance, isLoading, isUrgent }: OrderCardProps) {
  const transition = STATUS_TRANSITIONS[order.currentStatus as OrderStatus];

  /** Derive a human-readable relative drop-off time from createdAt */
  const dropOffTime = React.useMemo(() => {
    if (!order.createdAt) return null;
    const diff = Date.now() - new Date(order.createdAt).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }, [order.createdAt]);

  return (
    <Card
      variant="glass"
      className={`p-5 flex flex-col group hover:border-brand-blue/30 transition-all duration-300 shadow-lg shadow-slate-200/20 ${
        isUrgent ? "border-l-4 border-l-emerald-700" : ""
      }`}
    >
      {/* Top Row: Reference & Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="space-y-0.5 min-w-0">
          {/* Reference number — JetBrains Mono via font-mono alias */}
          <span className="block text-[11px] font-mono font-black text-slate-900 tracking-tighter">
            {order.referenceNumber}
          </span>
          <p className="text-[13px] font-bold text-slate-700 tracking-tight truncate">
            {order.customerName || "Walk-in Customer"}
          </p>
        </div>
        <StatusBadge status={order.currentStatus as OrderStatus} />
      </div>

      {/* Meta Row: Weight · Loads · Drop-off time */}
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 flex-wrap mb-4 flex-1">
        {/* Weight + loads */}
        <div className="flex items-center gap-1">
          <Scale className="h-3 w-3 text-slate-400" />
          <span>
            {order.weightKg != null ? `${order.weightKg}kg` : "—"} · {order.totalLoads ?? "—"} {UI_LABELS.units.LOADS}
          </span>
        </div>

        {dropOffTime && (
          <>
            <span className="h-1 w-1 rounded-full bg-slate-200" />
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-brand-blue" />
              <span>{dropOffTime}</span>
            </div>
          </>
        )}

      </div>

      {/* Staff Action: One-Tap Advance Lifecycle (§11.6) */}
      {transition && (
        <Button
          onClick={() => onAdvance(order.id!, transition.next)}
          disabled={isLoading}
          variant="primary"
          size="md"
          className={`w-full text-[10px] font-black uppercase tracking-wider gap-2 transition-all active:scale-95 shrink-0 ${
            isUrgent
              ? "bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-700/20"
              : "bg-brand-blue hover:bg-brand-blue/90 shadow-md shadow-brand-blue/10"
          }`}
        >
          {transition.label}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      )}
    </Card>
  );
}
