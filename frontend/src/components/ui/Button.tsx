"use client";

import * as React from "react";
import { ButtonProps } from "@/types/components";

/**
 * Standardized Button Atom — v5.0 Premium
 * Adheres to FRONT-001 §4.1 (Button Hierarchy)
 * Follows HCI standards for touch targets (min-h 44px).
 * Updated with 2xl radius and high-fidelity shadow work.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", isLoading, children, disabled, leftIcon, rightIcon, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-offset-0 touch-manipulation rounded-2xl gap-grid-4";

    const variants = {
      primary: "bg-brand-blue text-white hover:bg-brand-blue/90 hover:shadow-xl hover:shadow-brand-blue/20 active:scale-95 focus:ring-brand-blue/10 shadow-lg shadow-brand-blue/10 border-b-4 border-black/10",
      action: "bg-brand-cyan-dark text-white hover:bg-brand-cyan-dark/90 hover:shadow-xl hover:shadow-brand-cyan-dark/20 active:scale-95 focus:ring-brand-cyan-dark/10 shadow-lg shadow-brand-cyan-dark/10 border-b-4 border-black/10",
      secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 focus:ring-slate-100 shadow-sm",
      danger: "bg-error-700 text-white hover:bg-error-800 hover:shadow-xl hover:shadow-error-700/20 active:scale-95 focus:ring-error-700/10 shadow-lg shadow-error-700/10 border-b-4 border-black/10",
      ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 focus:ring-slate-100",
      outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-brand-blue/30 hover:text-brand-blue active:scale-95 focus:ring-brand-blue/5",
    };

    const sizes = {
      sm: "text-[9px] px-grid-4 py-grid-2 min-h-[38px] rounded-xl gap-grid-2",
      md: "text-[10px] px-grid-6 py-grid-3 min-h-[48px]", // Enhanced target size
      lg: "text-[12px] px-grid-10 py-grid-4 min-h-[56px] tracking-[0.25em]",
      icon: "p-2.5 min-h-[48px] min-w-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="inline-flex items-center shrink-0">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
        {!isLoading && leftIcon && (
          <span className="inline-flex items-center justify-center shrink-0 opacity-80 group-hover:scale-110 transition-all duration-300">
            {React.isValidElement(leftIcon) 
              ? React.cloneElement(leftIcon as React.ReactElement<any>, { className: "h-[1.1em] w-[1.1em] stroke-[2.5]" }) 
              : leftIcon}
          </span>
        )}
        <span className="relative z-10 leading-none flex items-center pt-[1px]">
          {children}
        </span>
        {!isLoading && rightIcon && (
          <span className="inline-flex items-center justify-center shrink-0 opacity-80 group-hover:scale-110 transition-all duration-300">
            {React.isValidElement(rightIcon) 
              ? React.cloneElement(rightIcon as React.ReactElement<any>, { className: "h-[1.1em] w-[1.1em] stroke-[2.5]" }) 
              : rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
