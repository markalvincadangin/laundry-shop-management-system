import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UI_LABELS } from "@/constants/ui";
import { WashingMachine } from "lucide-react";

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
      <div className="relative flex items-center justify-center">
        {/* Advanced SVG Spinner: Dual-Layer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          className={`${compact ? 'h-grid-12 w-grid-12' : 'h-grid-24 w-grid-24'}`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            <defs>
              <linearGradient id="spinner-gradient-premium" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#15489d" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#30a8d4" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-100"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#spinner-gradient-premium)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="160 300"
              animate={{ strokeDasharray: ["160 300", "80 300", "160 300"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        {/* Central Icon: Semantic Anchor */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <WashingMachine 
              className={`${compact ? 'h-5 w-5' : 'h-8 w-8'} text-brand-blue`} 
              strokeWidth={1.5}
            />
          </motion.div>
        </div>
        
        {/* Glow Effect: Depth & Polish */}
        <div className="absolute inset-0 bg-brand-blue/15 rounded-full blur-3xl -z-10 animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-[10px] font-black font-display uppercase tracking-[0.4em] text-brand-blue animate-pulse pl-[0.4em]">
          {label}
        </span>
        {!compact && (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-50">
            {UI_LABELS.shared.common.PLEASE_WAIT}
          </span>
        )}
      </motion.div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-grid-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="p-grid-12 rounded-[3.5rem] bg-white/90 backdrop-blur-2xl shadow-2xl ring-1 ring-slate-950/5 flex items-center justify-center max-w-sm w-full"
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
