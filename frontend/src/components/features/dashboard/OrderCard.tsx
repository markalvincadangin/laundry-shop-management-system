"use client";

import React from "react";
import { ArrowRight, Clock, Scale, Zap, Package, Wind, FileText } from "lucide-react";
import { Card, Button, StatusBadge, Tooltip } from "@/components/ui";
import { OrderResponse } from "@/services/orders.service";
import { STATUS_TRANSITIONS, OrderStatus } from "@/constants/order-status";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="glass"
        className={`p-5 flex flex-col group hover:shadow-2xl hover:shadow-slate-300/40 transition-all duration-500 border-slate-200/60 relative overflow-hidden ${
          isUrgent ? "border-l-[6px] border-l-emerald-500 ring-1 ring-emerald-500/10 shadow-lg shadow-emerald-500/5" : "hover:translate-y-[-6px]"
        }`}
      >
        {/* Service Type Icon Overlay — decorative ambient icon per order type */}
        <div className="absolute top-[-10px] right-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
          {order.serviceType === 'WASH_DRY_FOLD_RUSH' ? (
            <Zap className="h-32 w-32 rotate-12" />
          ) : order.serviceType === 'BLANKETS' ? (
            <Wind className="h-32 w-32 rotate-12" />
          ) : (
            <Package className="h-32 w-32 rotate-12" />
          )}
        </div>
      {/* Header: Identity & Status (§11.2) */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between gap-3">
          <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-[10px] font-mono font-bold text-slate-900 tracking-widest uppercase shadow-sm">
            {order.referenceNumber}
          </span>
          <div className="shrink-0 scale-90 origin-right">
            <StatusBadge status={order.currentStatus as OrderStatus} />
          </div>
        </div>
        
        {/* HCI: Name gets full width to prevent truncation */}
        <h3 className="text-[16px] font-black text-slate-900 tracking-tight line-clamp-2 break-words font-display leading-tight flex items-center gap-2">
          {order.customerName || "Walk-in Customer"}
          {order.serviceType === 'WASH_DRY_FOLD_RUSH' && (
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse shrink-0" aria-label="Rush Order" />
          )}
        </h3>
      </div>

      {/* Special Instructions (§1.4) */}
      {order.notes && (
        <div className="mb-5 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 flex items-start gap-2 group/notes">
          <FileText className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] font-bold text-amber-800 leading-tight line-clamp-2 italic">
            {order.notes}
          </p>
        </div>
      )}

      {/* Meta Row: Weight · Loads · Drop-off time */}
      <div className="flex flex-col gap-3 text-[11px] font-medium text-slate-500 mb-6 flex-1">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-slate-100/80 flex items-center justify-center border border-slate-200/50">
              <Scale className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <span className="font-semibold text-slate-700">
              {order.weightKg != null ? `${order.weightKg}kg` : "—"}{" "}
              <span className="text-slate-300 mx-1">/</span>{" "}
              {order.totalLoads ?? 0}{" "}
              {order.totalLoads === 1 ? UI_LABELS.units.LOAD : UI_LABELS.units.LOADS}
            </span>
          </div>
          
          {dropOffTime && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-brand-blue" />
              <span className="text-slate-500 whitespace-nowrap font-mono text-[10px]">{dropOffTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Staff Action: One-Tap Advance Lifecycle */}
      {transition && (
        <Tooltip content={`Advance to ${transition.next.replace(/_/g, ' ')}`} position="top">
          <Button
            onClick={() => onAdvance(order.id!, transition.next)}
            disabled={isLoading}
            variant="primary"
            size="md"
            className={`w-full text-[11px] font-bold uppercase tracking-[0.15em] h-12 gap-3 transition-all active:scale-[0.98] rounded-xl shadow-xl shadow-brand-blue/10 font-display ${
              isUrgent
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                : "bg-brand-blue hover:bg-brand-blue/90"
            }`}
          >
            {transition.label}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </Tooltip>
      )}
      </Card>
    </motion.div>
  );
}
