"use client";

import { OrderStatusBadge } from "./OrderStatusBadge";

const ORDER_STATUS_FLOW = [
  "RECEIVED",
  "WASHING",
  "DRYING",
  "FOLDING",
  "READY_FOR_PICKUP",
  "RELEASED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Received",
  WASHING: "Washing",
  DRYING: "Drying",
  FOLDING: "Folding",
  READY_FOR_PICKUP: "Ready for Pickup",
  RELEASED: "Released",
};

interface StatusLog {
  previousStatus: string | null;
  newStatus: string;
  changedAt: string | null;
  notes?: string | null;
}

interface OrderStatusTimelineProps {
  currentStatus: string;
  statusLogs?: StatusLog[] | null;
}

/** Build a map of status -> timestamp from logs */
function buildStatusTimestamps(logs: StatusLog[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const log of logs) {
    if (log.newStatus && log.changedAt) {
      map.set(log.newStatus, log.changedAt);
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
  statusLogs = [],
}: OrderStatusTimelineProps) {
  const timestamps = buildStatusTimestamps(statusLogs ?? []);
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
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  isPast
                    ? "bg-primary-500 text-white"
                    : isCurrent
                      ? "border-2 border-primary-500 bg-white text-primary-600 ring-2 ring-primary-100"
                      : "border-2 border-slate-200 bg-white text-slate-400"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isPast ? "✓" : index + 1}
              </div>
              {index < ORDER_STATUS_FLOW.length - 1 && (
                <div
                  className={`mt-1 h-8 w-0.5 flex-1 ${
                    isPast ? "bg-primary-500" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              )}
            </div>
            <div className="flex-1 pb-6">
              <p
                className={`font-medium ${
                  isCurrent
                    ? "text-primary-600"
                    : isPast
                      ? "text-slate-800"
                      : "text-slate-400"
                }`}
              >
                {label}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {timestamp
                  ? new Date(timestamp).toLocaleString(undefined, {
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            ✕
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-600">Cancelled</p>
            <p className="mt-0.5 text-sm text-slate-500">
              {timestamps.get("CANCELLED")
                ? new Date(timestamps.get("CANCELLED")!).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
