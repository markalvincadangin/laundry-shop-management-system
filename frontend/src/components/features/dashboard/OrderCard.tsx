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
export function OrderCard({ order, onAdvance, isLoading, isUrgent, isSystemPaused }: OrderCardProps) {
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
      <div className="flex flex-col gap-4 mb-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200/50 text-[9px] font-mono font-black text-slate-800 tracking-widest uppercase shadow-sm">
              {order.trackingNumber}
            </span>
            {isRush && (
              <StatusBadge label="RUSH" variant="rush" className="px-2 py-1 text-[8px] h-auto" />
            )}
          </div>
          <div className="shrink-0 scale-90 origin-right">
            <StatusBadge status={order.currentStatus as OrderStatus} />
          </div>
        </div>
        
        <h3 className="text-sm font-black text-slate-900 tracking-tight line-clamp-2 break-words leading-tight flex items-center gap-2">
          {order.customerName || "Walk-in Customer"}
          {isRush && (
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse shrink-0" aria-label="Rush Order" />
          )}
        </h3>
      </div>

      {/* Special Instructions */}
      {order.notes && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100/50 flex items-start gap-2 relative z-10">
          <FileText className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs font-bold text-amber-800 leading-tight line-clamp-2 italic opacity-80 break-words whitespace-pre-wrap">
            {order.notes}
          </p>
        </div>
      )}

      {/* Meta Row */}
      <div className="flex flex-col gap-4 text-xs font-medium text-slate-500 mb-6 flex-1 relative z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
              <Scale className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-xs font-black text-slate-700">
              {order.weightKg != null ? `${order.weightKg}kg` : "—"}{" "}
              <span className="text-slate-200 mx-2">{UI_LABELS.dynamic.STR_6666cd}</span>{" "}
              {order.totalLoads ?? 0}{" "}
              {order.totalLoads === 1 ? UI_LABELS.units.LOAD : UI_LABELS.units.LOADS}
            </span>
          </div>
          
          {dropOffTime && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 shadow-sm">
              <Clock className="h-4 w-4 text-brand-blue/60" />
              <span className="text-slate-500 whitespace-nowrap font-black text-[9px] uppercase tracking-wider">{dropOffTime}</span>
            </div>
          )}
        </div>
        
        {/* Assigned Machines Display */}
        {order.assignedMachines && order.assignedMachines.length > 0 ? (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-cyan/10 border border-brand-cyan/20">
              <WashingMachine className="h-3.5 w-3.5 text-brand-cyan" />
              <span className="text-[9px] font-black uppercase tracking-wider text-brand-cyan-dark">
                {order.assignedMachines.join(", ")}
              </span>
            </div>
          </div>
        ) : order.machineIds && order.machineIds.length > 0 ? (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-cyan/10 border border-brand-cyan/20">
              <WashingMachine className="h-3.5 w-3.5 text-brand-cyan" />
              <span className="text-[9px] font-black uppercase tracking-wider text-brand-cyan-dark">
                {order.machineIds.length} {order.machineIds.length === 1 ? UI_LABELS.modules.machines.MACHINE_SINGULAR : UI_LABELS.modules.machines.MACHINE_PLURAL}
              </span>
            </div>
          </div>
        ) : null}
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
