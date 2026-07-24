import React from "react";
import { motion } from "framer-motion";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Universal Spinner Atom
 * Premium dual-layer gradient SVGs standardized across the system.
 */
export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-24 w-24", // Used by full-page LoadingState
  };

  const strokeWidths = {
    sm: "12",
    md: "8",
    lg: "6",
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
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
          strokeWidth={strokeWidths[size]}
          className="text-slate-100/50"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="url(#spinner-gradient-premium)"
          strokeWidth={strokeWidths[size]}
          strokeLinecap="round"
          strokeDasharray="160 300"
          animate={{ strokeDasharray: ["160 300", "80 300", "160 300"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}
