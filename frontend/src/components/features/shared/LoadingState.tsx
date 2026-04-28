"use client";

import React from "react";
import { UI_LABELS } from "@/constants/ui";

interface LoadingStateProps {
  label?: string;
  compact?: boolean;
  fullPage?: boolean;
}

/**
 * Shared LoadingState Component
 * Standardizes loading indicators across the dashboard.
 * Aligned with FRONT-001 (Brand-cyan-dark tokens) and §8.1 DRY.
 */
export function LoadingState({ 
  label = UI_LABELS.shared.common.LOADING,
  compact = false,
  fullPage = false
}: LoadingStateProps) {
  const containerClasses = fullPage 
    ? "fixed inset-0 z-[500] bg-white/80 backdrop-blur-md flex items-center justify-center"
    : `w-full flex flex-col items-center justify-center gap-grid-6 animate-in fade-in duration-500 ${compact ? 'h-auto' : 'min-h-[70vh]'}`;

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-grid-6">
        <div className="relative">
          <div className={`${compact ? 'h-grid-10 w-grid-10' : 'h-grid-20 w-grid-20'} rounded-full border-[5px] border-brand-blue/10 border-t-brand-blue animate-spin shadow-xl shadow-brand-blue/5`} />
          <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <span className="text-body-sm font-black uppercase tracking-[0.2em] text-brand-blue animate-pulse">
          {label}
        </span>
      </div>
    </div>
  );
}
