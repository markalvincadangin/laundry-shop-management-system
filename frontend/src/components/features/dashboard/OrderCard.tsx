"use client";

import React from "react";
import { ArrowRight, Clock, Scale, Zap, FileText, WashingMachine } from "lucide-react";
import { Card, Button, StatusBadge, Tooltip } from "@/components/ui";
import { OrderResponse } from "@/lib/api/orders";
import { STATUS_TRANSITIONS, OrderStatus } from "@/constants/order-status";
import { motion } from "framer-motion";
import { UI_LABELS } from "@/constants/ui";

interface OrderCardProps {
  order: OrderResponse;
  machines?: Array<{ id: string; name: string }>;
  onAdvance: (orderId: string, nextStatus: OrderStatus) => void;
  isLoading?: boolean;
  /** When true, applies Urgent State left-border accent (§11.5 — Ready for Pickup column) */
  isUrgent?: boolean;
  isSystemPaused?: boolean;
}

/**
 * OrderCard — High-density Kanban card for the Order Pipeline (v4.0).
 * FRONT-001 §11.2, §11.5.
 * Reimagined with glassmorphism and premium micro-interactions.
 */
export function OrderCard({ order, machines = [], onAdvance, isLoading, isUrgent, isSystemPaused }: OrderCardProps) {
  const transition = STATUS_TRANSITIONS[order.currentStatus as OrderStatus];
  const isRush = order.isRush;

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

  const machineText = React.useMemo(() => {
    if (order.assignedMachines && order.assignedMachines.length > 0) {
      return order.assignedMachines.join(", ");
    }
    if (order.machineIds && order.machineIds.length > 0) {
      const machinesMap = new Map(machines.map((m) => [m.id, m.name]));
      return order.machineIds
        .map((id) => {
          if (machinesMap.has(id)) {
            return machinesMap.get(id)!;
          }
          if (/^m?\d+$/i.test(id)) {
            const num = id.replace(/\D/g, "");
            return `A${num}`;
          }
          return id.replace(/[-_]/g, " ");
        })
        .join(", ");
    }
    return null;
  }, [order.assignedMachines, order.machineIds, machines]);

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
        className={`p-4 flex flex-col group hover:shadow-2xl hover:shadow-slate-300/40 transition-all duration-500 border-slate-200/60 relative overflow-hidden ${
          isUrgent ? "border-l-[8px] border-l-emerald-500 ring-1 ring-emerald-500/10 shadow-lg shadow-emerald-500/5" : "hover:translate-y-[-6px]"
        }`}
      >
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />

      {/* Header: Identity & Status */}
      <div className="flex flex-col gap-2 mb-3 relative z-10">
        {/* Top Row: Tracking ID & Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/60 text-[9.5px] font-mono font-black text-slate-800 tracking-wider uppercase whitespace-nowrap shrink-0">
            {order.trackingNumber}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isRush && (
              <StatusBadge label="RUSH" variant="rush" className="px-2 py-0.5 text-[8px] h-auto shrink-0" />
            )}
            {dropOffTime && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100/80 shrink-0">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-slate-400 whitespace-nowrap font-black text-[8.5px] uppercase tracking-wider">{dropOffTime}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Name Row */}
        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight line-clamp-1 break-words leading-tight flex items-center gap-1.5 pt-0.5">
          <span className="truncate">{order.customerName || "Walk-in Customer"}</span>
          {isRush && (
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-pulse shrink-0" aria-label="Rush Order" />
          )}
        </h3>
      </div>

      {/* Special Instructions */}
      {order.notes && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/60 flex items-start gap-2 relative z-10">
          <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-amber-900 leading-tight line-clamp-2 italic opacity-90 break-words whitespace-pre-wrap">
            {order.notes}
          </p>
        </div>
      )}

      {/* Meta Row */}
      <div className="flex flex-col gap-2 text-xs font-medium text-slate-500 mb-4 flex-1 relative z-10">
        <div className="flex items-center justify-between w-full bg-slate-50/80 px-2.5 py-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Scale className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-black text-slate-700">
              {order.weightKg != null ? `${order.weightKg} kg` : "—"}{" "}
              <span className="text-slate-300 mx-1">•</span>{" "}
              {order.totalLoads ?? 0}{" "}
              {order.totalLoads === 1 ? UI_LABELS.units.LOAD : UI_LABELS.units.LOADS}
            </span>
          </div>
        </div>
        
        {/* Assigned Machines Display (Only active during WASHING and DRYING stages) */}
        {(order.currentStatus === "WASHING" || order.currentStatus === "DRYING") && machineText && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 w-fit">
            <WashingMachine className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
            <span className="text-[8.5px] font-black uppercase tracking-wider text-brand-cyan-dark truncate max-w-[180px]">
              {machineText}
            </span>
          </div>
        )}
      </div>

      {/* Action Area */}
      {transition && (() => {
        const isBlockedByPause = isSystemPaused && (transition.next === 'WASHING' || transition.next === 'DRYING');
        return (
          <div className="relative z-10">
            <Tooltip content={
              isBlockedByPause
                ? UI_LABELS.modules.settings.ORDER_CARD.ACTION_DISABLED_PAUSED
                : `Move to ${transition.next.replace(/_/g, ' ').toLowerCase()}`
            } position="top">
              <Button
                data-testid="next-step-button"
                onClick={() => onAdvance(order.id!, transition.next)}
                disabled={isLoading || isBlockedByPause}
                variant="primary"
                size="md"
                className={`w-full text-[10px] font-black uppercase tracking-[0.2em] h-12 gap-4 transition-all active:scale-[0.98] rounded-xl shadow-xl shadow-brand-blue/10 ${
                  isBlockedByPause
                    ? "bg-slate-400 hover:bg-slate-500 shadow-slate-400/20 opacity-50 cursor-not-allowed"
                    : isUrgent
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-brand-blue hover:bg-brand-blue/90"
                }`}
              >
                {isBlockedByPause ? UI_LABELS.modules.settings.ORDER_CARD.BTN_SYSTEM_PAUSED : transition.label}
                {!isBlockedByPause && <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />}
              </Button>
            </Tooltip>
          </div>
        );
      })()}
      </Card>
    </motion.div>
  );
}
