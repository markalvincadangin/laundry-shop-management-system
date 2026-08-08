"use client";

import React from "react";
import { Search, ShieldCheck, Clock, Package, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";

interface TrackingSearchProps {
  trackingNumber: string;
  setTrackingNumber: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isAlreadyDisplayed: boolean;
  hasResult: boolean;
  hasError?: boolean;
}

export function TrackingSearch({
  trackingNumber,
  setTrackingNumber,
  handleSubmit,
  loading,
  isAlreadyDisplayed,
  hasResult,
  hasError = false,
}: TrackingSearchProps) {
  return (
    <section
      className={`relative px-grid-8 lg:px-grid-12 flex flex-col items-center transition-all duration-700 ${
        hasResult ? "pt-28 pb-grid-6" : "pt-32 pb-grid-12"
      }`}
    >
      {/* Decorative gradient blur background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[110%] h-[400px] bg-gradient-to-b from-brand-blue/[0.04] to-transparent rounded-full blur-[100px]" />
      </div>

      <div
        className={`max-w-3xl w-full relative z-10 text-center transition-all duration-700 ${
          hasResult ? "space-y-grid-4" : "space-y-grid-8"
        }`}
      >
        {/* Headline — contextual for normal vs error state */}
        {!hasResult && (
          <div className="space-y-grid-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-grid-2 px-grid-4 py-grid-1.5 bg-brand-blue/5 rounded-full border border-brand-blue/10 shadow-xs backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" strokeWidth={2.5} />
              <p className="text-caption font-black text-brand-blue uppercase tracking-[0.3em]">
                {UI_LABELS.portal.tracking.OFFICIAL_PORTAL}
              </p>
            </div>
            
            <h2 className="text-h1 sm:text-display font-black font-display text-slate-900 tracking-tighter leading-[0.95] max-w-2xl mx-auto drop-shadow-xs uppercase">
              {hasError ? UI_LABELS.portal.tracking.ERROR_PROMPT : UI_LABELS.portal.tracking.PROMPT}
            </h2>
            
            <p className="text-body font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
              {hasError 
                ? UI_LABELS.portal.tracking.NOT_FOUND_DESC 
                : UI_LABELS.portal.tracking.PROMPT_SUBTITLE}
            </p>
          </div>
        )}

        {/* Search form */}
        <div className="max-w-2xl mx-auto w-full group relative">
          {!hasResult && (
            <>
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
            </>
          )}
          
          <form
            onSubmit={handleSubmit}
            className="relative bg-white/90 backdrop-blur-xl p-grid-2 rounded-[2.5rem] shadow-2xl shadow-brand-blue/10 border border-slate-200/80 ring-1 ring-slate-900/5 transition-all duration-300 focus-within:shadow-brand-blue/20 focus-within:ring-2 focus-within:ring-brand-blue/20"
          >
            <div className="flex flex-col sm:flex-row gap-grid-2">
              <div className="flex-1 relative flex items-center">
                <div className="absolute left-grid-4 p-grid-2 bg-brand-blue/5 rounded-2xl text-brand-blue transition-all group-focus-within:bg-brand-blue group-focus-within:text-white">
                  <Search className="h-grid-5 w-grid-5" strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  placeholder={UI_LABELS.portal.tracking.PLACEHOLDER}
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  className="w-full h-grid-18 bg-transparent rounded-[2rem] pl-grid-20 pr-grid-6 font-mono text-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:outline-none uppercase tracking-wider font-bold"
                  autoFocus={!hasResult}
                />
                {trackingNumber && (
                  <button
                    type="button"
                    onClick={() => setTrackingNumber("")}
                    className="absolute right-grid-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label={UI_LABELS.shared.buttons.CANCEL}
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                isLoading={loading}
                className="h-grid-18 min-h-[44px] px-grid-8 gap-grid-2 bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 font-black uppercase text-[11px] tracking-[0.25em] rounded-[1.8rem] active:scale-95 transition-all"
              >
                {hasError ? UI_LABELS.portal.tracking.BUTTON_TRY_AGAIN : UI_LABELS.portal.tracking.BUTTON_FIND}
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Button>
            </div>
          </form>

          {!hasResult && (
            <div className="flex flex-wrap justify-center gap-grid-8 mt-grid-6">
              <div className="flex items-center gap-grid-2">
                <Clock className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
                <span className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                  {UI_LABELS.portal.tracking.REAL_TIME_SYNC}
                </span>
              </div>
              <div className="flex items-center gap-grid-2">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
                <span className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                  {UI_LABELS.portal.tracking.VERIFIED_DATA}
                </span>
              </div>
              <div className="flex items-center gap-grid-2">
                <Package className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
                <span className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                  {UI_LABELS.portal.tracking.OFFICIAL_RECEIPT_ONLY}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
