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
  
  // Research: Enforce 'en-PH' to prevent locale-leak (e.g. European dot/comma swap)
  const formatted = value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Standard: Sync with FRONT-001 Typography Tokens
  const sizeClasses = {
    sm: "text-caption",
    md: "text-body",
    lg: "text-h2 font-bold",
    xl: "text-display font-extrabold tracking-tight"
  };

  return (
    <div className={`inline-flex items-baseline gap-0.5 ${sizeClasses[size]} ${className}`}>
      {/* Symbol: Dimmed by 70% opacity - Industry standard to prioritize value over unit */}
      <span className={`opacity-70 font-medium ${symbolClassName}`}>
        {UI_LABELS.units.PRICE_SYMBOL}
      </span>
      {/* Tabular: Using font-sans (Inter) + tabular-nums. 
          The 'Industry Gold Standard' for dashboards over raw font-mono. */}
      <span className={`${tabular ? "font-sans tabular-nums" : "font-sans"} ${numberClassName}`}>
        {formatted}
      </span>
    </div>
  );
}
