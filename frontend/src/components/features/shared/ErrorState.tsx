"use client";

import React from "react";
import { Button } from "@/components/ui";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

interface ErrorStateProps {
  error: Error | string | null;
  reset: () => void;
  title?: string;
  compact?: boolean;
}

/**
 * Shared ErrorState Component
 * Standardizes error boundaries across the dashboard.
 * Aligned with FRONT-001 (Rose-700 tokens) and §8.1 DRY.
 */
export function ErrorState({ 
  error, 
  reset, 
  title = UI_LABELS.feedback.error.SYSTEM_ERROR_TITLE,
  compact = false
}: ErrorStateProps) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;
  return (
    <div className={`w-full flex flex-col items-center justify-center p-grid-6 text-center animate-in fade-in zoom-in-95 duration-500 ${compact ? 'h-auto' : 'h-[60vh]'}`}>
      <div className={`${compact ? 'h-grid-12 w-grid-12 rounded-xl mb-grid-4' : 'h-grid-16 w-grid-16 rounded-2xl mb-grid-6'} bg-error-50 flex items-center justify-center ring-1 ring-error-700/20 shadow-sm`}>
        <AlertCircle className={`${compact ? 'h-grid-6 w-grid-6' : 'h-grid-8 w-grid-8'} text-error-700`} />
      </div>
      
      <h2 className={`${compact ? 'text-body-sm' : 'text-body-lg'} font-black text-slate-900 mb-grid-2 uppercase tracking-tight`}>
        {title}
      </h2>
      <p className="text-slate-500 text-caption font-bold uppercase tracking-widest max-w-sm mb-grid-8 leading-relaxed opacity-60">
        {message || UI_LABELS.feedback.error.SYSTEM_ERROR}
      </p>

      <Button
        onClick={() => reset()}
        variant="secondary"
        className={`gap-grid-2 shadow-lg shadow-error-700/5 uppercase text-caption tracking-widest font-black border-slate-200 ${compact ? 'h-10 px-grid-4' : 'h-14 px-grid-8'}`}
      >
        <RefreshCcw className="h-4 w-4" />
        {UI_LABELS.shared.buttons.RETRY}
      </Button>
    </div>
  );
}
