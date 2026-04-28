"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { SelectProps } from "@/types/components";

/**
 * Standardized Select Atom
 * Adheres to FRONT-001 §5.2 and §1.6 (Constraint-based Input)
 */
export function Select({
  label,
  error,
  variant = "default",
  containerClassName = "",
  className = "",
  children,
  ...props
}: SelectProps) {
  const variants = {
    default: "border-slate-200 bg-white text-slate-900",
    glass: "border-slate-200/60 bg-white/70 text-slate-900 shadow-sm backdrop-blur-md",
  };

  const selectId = React.useId();

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          id={selectId}
          className={`
            w-full h-14 appearance-none rounded-xl border px-4 text-sm font-medium
            focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 focus:outline-none 
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
            ${variants[variant]}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <ChevronDown 
          className={`
            absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-transform group-focus-within:rotate-180
            ${variant === "glass" ? "text-slate-400" : "text-slate-500"}
          `} 
        />
      </div>
      {error && (
        <p className="text-[10px] font-bold text-error-400 ml-1 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
