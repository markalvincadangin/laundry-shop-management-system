import React from "react";
import { ORDER_STATUS_META } from "@/constants/order-status";
import { StatusBadgeProps } from "@/types/components";

/**
 * StatusBadge: Presentational atom for all system statuses — v5.0
 * Supports both OrderStatus-driven metadata and manual overrides.
 * Hardened with premium typography and standardized high-fidelity variants.
 */
export function StatusBadge({
  status,
  label,
  variant = "neutral",
  icon: ManualIcon,
  className = "",
}: StatusBadgeProps) {
  // If an OrderStatus is provided, use the central metadata
  if (status && ORDER_STATUS_META[status]) {
    const config = ORDER_STATUS_META[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex shrink-0 items-center gap-grid-2 rounded-full border px-grid-4 py-grid-1.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 shadow-sm ${config.bgClass} ${config.textClass} ${className}`}
        role="status"
      >
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {config.label}
      </span>
    );
  }

  // Fallback to manual props or variants
  const variants = {
    primary: "bg-brand-blue/5 border-brand-blue/10 text-brand-blue",
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
    warning: "bg-amber-50 border-amber-100 text-amber-700",
    error: "bg-rose-50 border-rose-100 text-rose-700",
    rush: "bg-rose-600 border-rose-700 text-white shadow-lg shadow-rose-600/20 animate-pulse",
    action: "bg-brand-blue/10 border-brand-blue/20 text-brand-blue shadow-[0_0_15px_rgba(21,72,157,0.08)]",
    neutral: "bg-slate-100/50 border-slate-200 text-slate-500",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-grid-2 rounded-full border px-grid-4 py-grid-1.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 shadow-sm ${variants[variant]} ${className}`}
      role="status"
    >
      {ManualIcon && <ManualIcon className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </span>
  );
}
