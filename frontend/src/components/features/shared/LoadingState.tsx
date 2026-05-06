import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UI_LABELS } from "@/constants/ui";

interface LoadingStateProps {
  label?: string;
  compact?: boolean;
  fullPage?: boolean;
}

/**
 * LoadingState — High Fidelity (v4.0)
 * Standardizes loading indicators across the dashboard.
 * Aligned with FRONT-001 §11.1 (Premium Perceived Performance).
 */
export function LoadingState({ 
  label = UI_LABELS.shared.common.LOADING,
  compact = false,
  fullPage = false
}: LoadingStateProps) {
  const content = (
    <div className={`flex flex-col items-center gap-grid-6 ${fullPage ? 'scale-110' : ''}`}>
      <div className="relative">
        {/* Advanced SVG Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={`${compact ? 'h-grid-10 w-grid-10' : 'h-grid-24 w-grid-24'}`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-blue)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--brand-blue)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#spinner-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="180 300"
            />
          </svg>
        </motion.div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue animate-pulse pl-[0.3em]">
          {label}
        </span>
        {!compact && (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-50">
            {UI_LABELS.shared.common.PLEASE_WAIT}
          </span>
        )}
      </motion.div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white/70 backdrop-blur-xl flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-grid-10 rounded-[40px] bg-white shadow-2xl border border-slate-100/50 flex items-center justify-center"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-grid-6 animate-in fade-in duration-500 ${compact ? 'h-auto' : 'min-h-[60vh]'}`}>
      {content}
    </div>
  );
}
