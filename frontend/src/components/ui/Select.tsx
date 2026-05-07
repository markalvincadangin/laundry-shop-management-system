"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { SelectProps } from "@/types/components";

/**
 * Standardized Select Atom — v5.0 Premium
 * Adheres to FRONT-001 §5.2 and §1.6 (Constraint-based Input)
 * Hardened with 2xl radius, glassmorphism enhancements, and premium shadows.
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
  const isInvalid = Boolean(error);
  const selectId = React.useId();

  const variants = {
    default: isInvalid
      ? "border-error-700 bg-error-50/50 text-slate-900 focus:ring-4 focus:ring-error-700/10"
      : "border-slate-200 bg-white text-slate-900 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 shadow-sm shadow-slate-200/20",
    glass: isInvalid
      ? "border-error-700/50 bg-error-50/20 backdrop-blur-xl focus:ring-4 focus:ring-error-700/10"
      : "border-slate-200/60 bg-white/70 backdrop-blur-xl text-slate-900 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 shadow-inner shadow-slate-100/50",
  };

  return (
    <div className={`w-full group ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className={`mb-2.5 block text-[10px] font-black uppercase tracking-[0.2em] ml-1.5 transition-colors group-focus-within:text-brand-blue ${variant === "glass" ? "text-slate-400" : "text-slate-500"}`}
        >
          {label}
          {props.required && <span className="text-error-700 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          id={selectId}
          className={`
            w-full h-[52px] appearance-none rounded-2xl border px-grid-4 text-body font-medium
            focus:outline-none transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
            ${variants[variant]}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-4.5 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:rotate-180 group-focus-within:text-brand-blue">
          <ChevronDown className="h-5 w-5 opacity-60" />
        </div>
      </div>
      {isInvalid && (
        <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-error-700 ml-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
