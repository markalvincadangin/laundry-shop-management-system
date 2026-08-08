"use client";

import React from "react";
import Image from "next/image";
import {
  Package,
  Copy,
  Clock,
  CheckCircle2,
  Bell,
} from "lucide-react";
import type { components } from "@/types/api.generated";
type OrderTrackingResponse = components["schemas"]["OrderTrackingResponse"];
import { StatusBadge, Card } from "@/components/ui";
import { ProcessStepper } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { ORDER_STATUS, type OrderStatus } from "@/constants/order-status";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_MESSAGES: Record<string, string> = UI_LABELS.portal.tracking.STATUS_MSG;
const PICKUP_STATES = [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.RELEASED];

interface TrackingResultCardProps {
  order: OrderTrackingResponse;
}

export function TrackingResultCard({ order }: TrackingResultCardProps) {
  const isPickupState = order && PICKUP_STATES.includes(order.currentStatus as any);
  const StatusIcon = isPickupState ? CheckCircle2 : Bell;
  const statusIconColor = isPickupState ? "text-emerald-700" : "text-brand-cyan";

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast.success(UI_LABELS.feedback.success.COPIED);
  };

  const loadCount = order.totalLoads ?? 1;
  const loadUnit = loadCount === 1 ? UI_LABELS.units.LOAD.toUpperCase() : UI_LABELS.units.LOADS.toUpperCase();

  return (
    <div className="space-y-grid-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden border border-slate-100 shadow-xl shadow-brand-blue/5 ring-1 ring-slate-900/5 rounded-3xl bg-white">

        {/* Card Header — tracking number + status badge */}
        <div className="px-grid-8 py-grid-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-grid-4">
          <div className="flex items-center gap-grid-4">
            <div className="h-12 w-12 bg-brand-blue/5 rounded-2xl flex items-center justify-center shrink-0">
              <Package className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <div className="flex items-center gap-grid-2">
                <span className="font-mono font-bold text-slate-900 text-h3 tracking-widest uppercase">
                  {order.trackingNumber}
                </span>
                <button
                  onClick={() => copyRef(order.trackingNumber!)}
                  className="p-1.5 hover:bg-brand-blue/5 rounded-lg transition-all text-slate-400 hover:text-brand-blue"
                  title={UI_LABELS.portal.tracking.COPY_TITLE}
                  aria-label={UI_LABELS.portal.tracking.COPY_REF}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-grid-2 mt-0.5">
                <Clock className="h-3 w-3 text-slate-400" />
                <p className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                  {UI_LABELS.portal.tracking.RECEIVED_ON} {formatDateTime(order.createdAt!)}
                </p>
              </div>
            </div>
          </div>

          <StatusBadge
            status={order.currentStatus as OrderStatus}
            className="h-10 px-grid-6 text-caption font-bold"
          />
        </div>

        {/* Card Body */}
        <div className="px-grid-8 py-grid-8 space-y-grid-8">

          {/* Progress stepper section */}
          <div className="space-y-grid-4">
            <div className="flex items-center justify-between">
              <h4 className="text-caption font-bold text-slate-900 uppercase tracking-[0.3em]">
                {UI_LABELS.portal.tracking.CURRENT_PROGRESS}
              </h4>
              <div className="flex items-center gap-grid-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 animate-pulse" />
                <span className="text-caption font-bold text-emerald-700 uppercase tracking-[0.2em]">
                  {UI_LABELS.shared.common.LIVE}
                </span>
              </div>
            </div>

            <div className="px-grid-4 py-grid-6 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto">
              <ProcessStepper
                currentStatus={order.currentStatus ?? ORDER_STATUS.RECEIVED}
                size="md"
              />
            </div>
          </div>

          {/* Order summary meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-grid-6 pt-grid-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <p className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                {UI_LABELS.portal.tracking.RECEIVED_ON}
              </p>
              <p className="text-body font-bold text-slate-900">
                {formatDateTime(order.createdAt!)}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                {UI_LABELS.shared.common.WEIGHT}
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-body font-bold text-slate-900">
                  {order.weightKg ?? 0} {UI_LABELS.units.WEIGHT}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                {UI_LABELS.units.LOADS}
              </p>
              <p className="text-body font-bold text-slate-900">
                {loadCount} {loadUnit}
              </p>
            </div>
          </div>

          {/* Status message block */}
          <div 
            className={`relative p-grid-8 rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl ${
              order.currentStatus === 'RELEASED' 
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-emerald-500/20' 
                : 'bg-slate-900 text-white'
            }`}
          >
            {order.currentStatus === 'RELEASED' && (
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <CheckCircle2 className="h-24 w-24 -rotate-12" />
              </div>
            )}

            <div className="relative flex flex-col sm:flex-row items-start gap-grid-6 z-10">
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${
                order.currentStatus === 'RELEASED'
                  ? 'bg-white/20 border-white/20'
                  : 'bg-white/10 border-white/10'
              }`}>
                <StatusIcon className={`h-6 w-6 ${order.currentStatus === 'RELEASED' ? 'text-white' : statusIconColor}`} />
              </div>
              <div className="space-y-grid-2 flex-1">
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                  order.currentStatus === 'RELEASED' ? 'text-emerald-200' : 'text-brand-cyan'
                }`}>
                  {order.currentStatus === 'RELEASED' ? UI_LABELS.portal.tracking.SUCCESS_HEADER : UI_LABELS.portal.tracking.LIVE_UPDATE}
                </p>
                <p className="text-body font-bold text-white leading-relaxed">
                  {STATUS_MESSAGES[order.currentStatus ?? ""] ||
                    UI_LABELS.portal.tracking.FALLBACK_PROGRESS}
                </p>

                {isPickupState && order.currentStatus !== 'RELEASED' && (
                  <div className="mt-grid-4 pt-grid-4 border-t border-white/10 flex items-start gap-grid-3">
                    <CheckCircle2
                      className="h-5 w-5 text-white/80 shrink-0 mt-1"
                      strokeWidth={2}
                    />
                    <p className="text-body-sm font-medium text-white/80 leading-relaxed">
                      {UI_LABELS.portal.tracking.CLAIM_INSTRUCTION_PREFIX}{" "}
                      <button
                        onClick={() => copyRef(order.trackingNumber!)}
                        className="font-bold text-white underline decoration-dotted underline-offset-2 hover:no-underline transition-all"
                        title={UI_LABELS.portal.tracking.TAP_TO_COPY}
                      >
                        {order.trackingNumber}
                      </button>{" "}
                      {UI_LABELS.portal.tracking.CLAIM_INSTRUCTION_SUFFIX}
                    </p>
                  </div>
                )}

                {order.currentStatus === 'RELEASED' && (
                  <div className="mt-grid-4 pt-grid-4 border-t border-white/10">
                    <p className="text-sm font-bold text-emerald-100">
                       {UI_LABELS.portal.tracking.SEE_YOU_AGAIN}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom reminder text */}
          <p className="text-body-sm font-medium text-slate-500 text-center leading-relaxed">
            {UI_LABELS.portal.tracking.KEEP_SAFE_REMINDER}
          </p>
        </div>
      </Card>
    </div>
  );
}
