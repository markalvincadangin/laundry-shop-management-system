import React from "react";
import { ORDER_STATUS_META } from "@/constants/order-status";
import { StatusBadgeProps } from "@/types/components";
import { Badge } from "./Badge";

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
      <Badge
        variant="custom"
        className={`${config.bgClass} ${config.textClass} ${className}`}
        role="status"
      >
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge
      variant={variant as any}
      className={className}
      role="status"
    >
      {ManualIcon && <ManualIcon className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </Badge>
  );
}

