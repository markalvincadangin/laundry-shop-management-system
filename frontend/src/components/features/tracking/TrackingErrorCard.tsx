"use client";

import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";

interface TrackingErrorCardProps {
  error: string;
  trackingNumber: string;
  handleSearch: (ref: string) => void;
  handleTrackAnother: () => void;
}

export function TrackingErrorCard({
  error,
  trackingNumber,
  handleSearch,
  handleTrackAnother,
}: TrackingErrorCardProps) {
  return (
    <div className="relative p-grid-12 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 text-center space-y-grid-8 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden max-w-xl mx-auto ring-1 ring-slate-900/5">
      {/* Background texture for error */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(225,29,72,0.05),transparent)] pointer-events-none" />
      
      <div className="relative h-grid-24 w-grid-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 ring-4 ring-rose-50">
        <AlertCircle className="h-grid-12 w-grid-12" strokeWidth={1.5} />
      </div>
      <div className="relative space-y-grid-3">
        <h3 className="text-h3 font-black font-display text-slate-900 tracking-tight uppercase">
          {error}
        </h3>
        <p className="text-body font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
          {UI_LABELS.portal.tracking.NOT_FOUND_DESC}
        </p>
      </div>
      <div className="relative flex flex-col items-center gap-grid-4">
        <Button
          variant="primary"
          onClick={() => handleSearch(trackingNumber)}
          className="h-12 min-h-[48px] px-grid-12 gap-grid-3 font-black text-[11px] uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 rounded-2xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-900/40 focus-visible:outline-none"
        >
          <RefreshCcw className="h-4 w-4" strokeWidth={2.5} />
          {UI_LABELS.shared.buttons.RETRY}
        </Button>
        <button 
          onClick={handleTrackAnother}
          className="text-caption font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          {UI_LABELS.portal.tracking.CLEAR_SEARCH}
        </button>
      </div>
    </div>
  );
}
