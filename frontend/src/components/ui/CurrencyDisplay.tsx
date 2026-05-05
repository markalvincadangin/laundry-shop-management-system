"use client";

import React from "react";
import { UI_LABELS } from "@/constants/ui";

interface CurrencyDisplayProps {
  amount: number | undefined | null;
  className?: string;
  symbolClassName?: string;
  numberClassName?: string;
  /** When true, uses font-mono and tabular-nums (highly recommended for tables/reports) */
  tabular?: boolean;
  /** Large variant for KPI cards or grand totals */
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * CurrencyDisplay — Standardized high-fidelity currency component (FRONT-001 §2.3).
 * Enforces matched symbol sizing and professional tabular alignment.
 */
export function CurrencyDisplay({ 
  amount, 
  className = "", 
  symbolClassName = "", 
  numberClassName = "",
  tabular = true,
  size = "md"
}: CurrencyDisplayProps) {
  const value = amount ?? 0;
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sizeClasses = {
    sm: "text-[12px]",
    md: "text-[14px]",
    lg: "text-[20px] font-bold",
    xl: "text-[32px] font-extrabold tracking-tight"
  };

  return (
    <div className={`inline-flex items-baseline gap-0.5 ${sizeClasses[size]} ${className}`}>
      <span className={`opacity-70 font-medium ${symbolClassName}`}>
        {UI_LABELS.units.PRICE_SYMBOL}
      </span>
      <span className={`${tabular ? "font-mono tabular-nums" : ""} ${numberClassName}`}>
        {formatted}
      </span>
    </div>
  );
}
