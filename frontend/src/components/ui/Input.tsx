"use client";

import * as React from "react";
import { InputProps } from "@/types/components";

/**
 * Standardized Input Atom — v5.0 Premium
 * Adheres to FRONT-001 §5.1 and §1.6 (Error Prevention)
 * Hardened with 2xl radius, glassmorphism enhancements, and premium shadows.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, id, variant = "default", icon, rightElement, ...props }, ref) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;
    const isInvalid = Boolean(error);

    const variants = {
      default: isInvalid
        ? "border-error-700 bg-error-50/50 text-slate-900 focus:ring-4 focus:ring-error-700/10"
        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 shadow-sm shadow-slate-200/20",
      glass: isInvalid
        ? "border-error-700/50 bg-error-50/20 backdrop-blur-xl focus:ring-4 focus:ring-error-700/10"
        : "border-slate-200/60 bg-white/70 backdrop-blur-xl text-slate-900 placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 shadow-inner shadow-slate-100/50",
    };

    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={inputId}
            className={`mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] ml-1.5 transition-colors group-focus-within:text-brand-blue ${variant === "glass" ? "text-slate-400" : "text-slate-500"}`}
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
            className={`
              block w-full rounded-2xl border px-grid-4 py-grid-3.5 outline-none transition-all duration-300 min-h-[52px] font-medium text-body
              ${variants[variant]} 
              ${icon ? "pl-12" : ""} 
              ${rightElement ? "pr-12" : ""} 
              ${className}
              placeholder:text-slate-400 placeholder:font-medium
            `}
            {...props}
            value={props.value ?? (('value' in props) ? "" : undefined)}
            onWheel={(e) => {
              // Prevent accidental weight/price changes when scrolling (HCI-001 §4.2)
              if (props.type === "number") {
                e.currentTarget.blur();
              }
            }}
          />
          {icon && (
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue flex items-center justify-center transition-colors">
              {React.isValidElement(icon) 
                ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-[18px] w-[18px] stroke-[2.5]" }) 
                : icon}
            </div>
          )}
          {rightElement && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {isInvalid && (
          <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-error-700 ml-1.5 leading-none" role="alert">
            {error}
          </p>
        )}
        {!isInvalid && hint && (
          <p className="mt-2 text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1.5 opacity-70 leading-none">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
