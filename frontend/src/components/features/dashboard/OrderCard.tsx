"use client";

import React from "react";
import { ArrowRight, Clock, Scale, Zap, FileText } from "lucide-react";
import { Card, Button, StatusBadge, Tooltip } from "@/components/ui";
import { OrderResponse } from "@/services/orders.service";
import { STATUS_TRANSITIONS, OrderStatus } from "@/constants/order-status";
import { motion } from "framer-motion";
import { UI_LABELS } from "@/constants/ui";

interface OrderCardProps {
  order: OrderResponse;
  onAdvance: (orderId: number, nextStatus: OrderStatus) => void;
  isLoading?: boolean;
  /** When true, applies Urgent State left-border accent (§11.5 — Ready for Pickup column) */
  isUrgent?: boolean;
}

/**
 * OrderCard — High-density Kanban card for the Order Pipeline (v4.0).
 * FRONT-001 §11.2, §11.5.
 * Reimagined with glassmorphism and premium micro-interactions.
 */
export function OrderCard({ order, onAdvance, isLoading, isUrgent }: OrderCardProps) {
  const transition = STATUS_TRANSITIONS[order.currentStatus as OrderStatus];

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
        className={`p-grid-5 flex flex-col group hover:shadow-2xl hover:shadow-slate-300/40 transition-all duration-500 border-slate-200/60 relative overflow-hidden ${
          isUrgent ? "border-l-[6px] border-l-emerald-500 ring-1 ring-emerald-500/10 shadow-lg shadow-emerald-500/5" : "hover:translate-y-[-6px]"
        }`}
      >
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />

      {/* Header: Identity & Status */}
      <div className="flex flex-col gap-3 mb-5 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200/50 text-[9px] font-mono font-black text-slate-800 tracking-widest uppercase shadow-sm">
            {order.referenceNumber}
          </span>
          <div className="shrink-0 scale-90 origin-right">
            <StatusBadge status={order.currentStatus as OrderStatus} />
          </div>
        </div>
        
        <h3 className="text-[15px] font-black text-slate-900 tracking-tight line-clamp-2 break-words leading-tight flex items-center gap-2">
          {order.customerName || "Walk-in Customer"}
          {order.serviceType === 'WASH_DRY_FOLD_RUSH' && (
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse shrink-0" aria-label="Rush Order" />
          )}
        </h3>
      </div>

      {/* Special Instructions */}
      {order.notes && (
        <div className="mb-5 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100/50 flex items-start gap-2 relative z-10">
          <FileText className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] font-bold text-amber-800 leading-tight line-clamp-2 italic opacity-80">
            {order.notes}
          </p>
        </div>
      )}

      {/* Meta Row */}
      <div className="flex flex-col gap-3 text-[11px] font-medium text-slate-500 mb-6 flex-1 relative z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
              <Scale className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <span className="text-[11px] font-black text-slate-700">
              {order.weightKg != null ? `${order.weightKg}kg` : "—"}{" "}
              <span className="text-slate-200 mx-1">/</span>{" "}
              {order.totalLoads ?? 0}{" "}
              {order.totalLoads === 1 ? UI_LABELS.units.LOAD : UI_LABELS.units.LOADS}
            </span>
          </div>
          
          {dropOffTime && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-brand-blue/60" />
              <span className="text-slate-500 whitespace-nowrap font-black text-[9px] uppercase tracking-wider">{dropOffTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      {transition && (
        <div className="relative z-10">
          <Tooltip content={`Move to ${transition.next.replace(/_/g, ' ').toLowerCase()}`} position="top">
            <Button
              onClick={() => onAdvance(order.id!, transition.next)}
              disabled={isLoading}
              variant="primary"
              size="md"
              className={`w-full text-[10px] font-black uppercase tracking-[0.2em] h-12 gap-3 transition-all active:scale-[0.98] rounded-xl shadow-xl shadow-brand-blue/10 ${
                isUrgent
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-brand-blue hover:bg-brand-blue/90"
              }`}
            >
              {transition.label}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </Tooltip>
        </div>
      )}
      </Card>
    </motion.div>
  );
}
