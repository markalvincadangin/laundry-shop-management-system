"use client";

import * as React from "react";
import { CardProps } from "@/types/components";

/**
 * Standardized Card Component — v5.0
 * Adheres to FRONT-001 §3 (Layout & Containers)
 * Supports Glassmorphism, Accent, and the new High-Fidelity Premium variants.
 * v4.0 Consistency Pass: Standardized radius and shadow depth.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white border-slate-200 text-slate-900 shadow-sm",
      glass: "bg-white/80 border-slate-200/60 backdrop-blur-xl text-slate-900 shadow-2xl shadow-slate-200/30",
      "glass-light": "bg-white/40 border-slate-100/50 backdrop-blur-md text-slate-600 shadow-inner",
      accent: "bg-brand-blue/5 border-brand-blue/10 text-slate-900 shadow-[0_0_30px_rgba(21,72,157,0.05)]",
      flat: "bg-slate-50/50 border-slate-200/60 text-slate-900 shadow-none",
    };

    return (
      <div
        ref={ref}
        className={`rounded-3xl border transition-all duration-500 ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-grid-8 border-b border-slate-100/60 ${className}`} {...props} />
);

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-display font-black text-slate-900 tracking-tight leading-none ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-grid-8 ${className}`} {...props} />
);

export const CardFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-grid-8 border-t border-slate-100/60 flex items-center ${className}`} {...props} />
);
