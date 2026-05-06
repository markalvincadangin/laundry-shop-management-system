"use client";

import { UI_LABELS } from "@/constants/ui";
import type { OrderStatusTimelineProps } from "@/types/components";
import type { components } from "@/types/api.generated";
import { Check, X } from "lucide-react";

const ORDER_STATUS_FLOW = [
  "RECEIVED",
  "WASHING",
  "DRYING",
  "FOLDING",
  "READY_FOR_PICKUP",
  "RELEASED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: UI_LABELS.shared.status.RECEIVED,
  WASHING: UI_LABELS.shared.status.WASHING,
  DRYING: UI_LABELS.shared.status.DRYING,
  FOLDING: UI_LABELS.shared.status.FOLDING,
  READY_FOR_PICKUP: UI_LABELS.shared.status.READY_FOR_PICKUP,
  RELEASED: UI_LABELS.shared.status.RELEASED,
};

/** Build a map of status -> timestamp from logs */
function buildStatusTimestamps(logs: components["schemas"]["AuditLogResponse"][]): Map<string, string> {
  const map = new Map<string, string>();
  for (const log of logs) {
    const state = log.newState || {};
    const newStatus = state.current_status || state.status;
    if (newStatus && log.createdAt) {
      map.set(newStatus, log.createdAt);
    }
  }
  return map;
}

/**
 * Vertical stepper showing order status progression.
 * Past steps filled, current highlighted, future greyed.
 */
export function OrderStatusTimeline({
  currentStatus,
  auditLogs = [],
}: OrderStatusTimelineProps) {
  const timestamps = buildStatusTimestamps(auditLogs ?? []);
  const currentIndex = ORDER_STATUS_FLOW.indexOf(
    currentStatus as (typeof ORDER_STATUS_FLOW)[number]
  );
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className="space-y-0" role="list" aria-label="Order status timeline">
      {ORDER_STATUS_FLOW.map((status, index) => {
        const isPast = index < currentIndex || isCancelled;
        const isCurrent = status === currentStatus && !isCancelled;
        const isFuture = index > currentIndex && !isCancelled;
        const timestamp = timestamps.get(status);
        const label = STATUS_LABELS[status] ?? status.replace(/_/g, " ");

        return (
          <div
            key={status}
            className="flex items-start gap-4"
            role="listitem"
          >
            <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-all duration-300 tabular-nums ${
                    isPast
                      ? "bg-brand-blue text-white shadow-md shadow-brand-blue/10"
                      : isCurrent
                        ? "bg-white text-brand-blue ring-4 ring-brand-blue/10 shadow-lg shadow-brand-blue/20 scale-110"
                        : "border border-slate-200 bg-slate-50 text-slate-300"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isPast || (isCurrent && status === "RELEASED") ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </div>
              {index < ORDER_STATUS_FLOW.length - 1 && (
                <div
                  className={`mt-1 h-8 w-0.5 flex-1 transition-colors duration-300 ${
                    isPast ? "bg-brand-blue/40" : "bg-slate-100"
                  }`}
                  aria-hidden
                />
              )}
            </div>
            <div className="flex-1 pb-6">
              <p
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isCurrent
                    ? "text-brand-blue"
                    : isPast
                      ? "text-slate-900"
                      : "text-slate-400"
                }`}
              >
                {label}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-500 font-mono tabular-nums">
                {timestamp
                  ? new Date(timestamp).toLocaleString("en-PH", {
                      timeZone: "Asia/Manila",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold shadow-sm">
            <X className="h-4 w-4" />
          </div>
          <div className="flex-1 pb-6">
            <p className="text-sm font-extrabold uppercase tracking-widest text-rose-600">{UI_LABELS.shared.status.CANCELLED}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {timestamps.get("CANCELLED")
                ? new Date(timestamps.get("CANCELLED")!).toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" })
                : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
