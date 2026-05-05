"use client";

import * as React from "react";
import { InputProps } from "@/types/components";

/**
 * Standardized Input Atom
 * Adheres to FRONT-001 §5.1 and §1.6 (Error Prevention)
 * Rebuilt with React.useId to prevent hydration mismatches.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, id, variant = "default", icon, rightElement, ...props }, ref) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;
    const isInvalid = Boolean(error);

    const variants = {
      default: isInvalid
        ? "border-error-700 bg-error-50 text-slate-900 focus:ring-2 focus:ring-error-700/20"
        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10",
      glass: isInvalid
        ? "border-error-700/50 bg-error-50/10 backdrop-blur-xl focus:ring-2 focus:ring-error-700/20"
        : "border-slate-200/60 bg-white/70 backdrop-blur-xl text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`mb-2 block text-[10px] font-black uppercase tracking-widest ml-1 ${variant === "glass" ? "text-slate-400" : "text-slate-500"}`}
          >
            {label}
            {props.required && <span className="text-error-700 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={isInvalid}
            className={`block w-full rounded-xl border px-3 py-3 outline-none transition-all min-h-[44px] ${variants[variant]} ${icon ? "pl-11" : ""} ${rightElement ? "pr-11" : ""} ${className}`}
            {...props}
            onWheel={(e) => {
              // Prevent accidental weight/price changes when scrolling (HCI-001 §4.2)
              e.currentTarget.blur();
              e.stopPropagation();
            }}
          />
          {icon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          {rightElement && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {isInvalid && (
          <p className="mt-1.5 text-xs font-medium text-error-700" role="alert">
            {error}
          </p>
        )}
        {!isInvalid && hint && (
          <p className="mt-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
