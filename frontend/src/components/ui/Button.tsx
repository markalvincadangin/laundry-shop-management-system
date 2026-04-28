"use client";

import * as React from "react";
import { ButtonProps } from "@/types/components";

/**
 * Standardized Button Atom
 * Adheres to FRONT-001 §4.1 (Button Hierarchy)
 * Follows HCI standards for touch targets (min-h 44px).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", isLoading, children, disabled, leftIcon, rightIcon, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation rounded-xl";

    const variants = {
      primary: "bg-brand-blue text-white hover:bg-brand-blue/90 active:scale-95 focus:ring-brand-blue/50 shadow-[0_0_15px_rgba(21,72,157,0.3)]",
      action: "bg-brand-cyan text-white hover:bg-brand-cyan/90 active:scale-95 focus:ring-brand-cyan/50 shadow-[0_0_15px_rgba(48,168,212,0.3)]",
      secondary: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 active:scale-95 focus:ring-slate-200",
      danger: "bg-error-700 text-white hover:bg-error-700/90 active:scale-95 focus:ring-error-700/50 shadow-lg shadow-error-700/20",
      ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-100",
      outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 focus:ring-slate-100",
    };

    const sizes = {
      sm: "text-[10px] px-3 py-1.5 min-h-[36px]",
      md: "text-[11px] px-5 py-2.5 min-h-[44px]", // HCI compliant min target size
      lg: "text-[12px] px-8 py-3.5 min-h-[52px]",
      icon: "p-2 min-h-[44px] min-w-[44px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-flex items-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
