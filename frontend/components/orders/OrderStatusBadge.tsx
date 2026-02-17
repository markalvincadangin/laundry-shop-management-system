"use client";

/**
 * Status badge with global color system per UI/UX Improvement Plan.
 * Status colors: Received (blue), Washing (amber), Drying (orange), Folding (purple),
 * Ready for Pickup (green), Released (gray), Cancelled (red).
 */

const STATUS_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string; icon?: string }
> = {
  RECEIVED: {
    label: "Received",
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    icon: "●",
  },
  WASHING: {
    label: "Washing",
    bgClass: "bg-amber-50",
    textClass: "text-amber-600",
    icon: "●",
  },
  DRYING: {
    label: "Drying",
    bgClass: "bg-orange-100",
    textClass: "text-orange-700",
    icon: "●",
  },
  FOLDING: {
    label: "Folding",
    bgClass: "bg-purple-50",
    textClass: "text-purple-600",
    icon: "●",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    bgClass: "bg-green-50",
    textClass: "text-green-600",
    icon: "●",
  },
  RELEASED: {
    label: "Released",
    bgClass: "bg-slate-100",
    textClass: "text-slate-500",
    icon: "●",
  },
  CANCELLED: {
    label: "Cancelled",
    bgClass: "bg-red-50",
    textClass: "text-red-600",
    icon: "●",
  },
};

interface OrderStatusBadgeProps {
  status: string;
  /** Use monospace for reference numbers in badges */
  mono?: boolean;
  className?: string;
}

export function OrderStatusBadge({
  status,
  mono = false,
  className = "",
}: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status?.replace(/_/g, " ") ?? "—",
    bgClass: "bg-slate-100",
    textClass: "text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${config.bgClass} ${config.textClass} ${mono ? "font-mono" : ""} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.icon && (
        <span className="text-[0.6em]" aria-hidden>
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  );
}
