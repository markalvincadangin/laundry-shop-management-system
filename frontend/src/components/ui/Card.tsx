"use client";

import * as React from "react";
import { CardProps } from "@/types/components";

/**
 * Standardized Card Component
 * Adheres to FRONT-001 §3 (Layout & Containers)
 * Supports Glassmorphism and Accent variants.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white border-slate-200 text-slate-900 shadow-sm",
      glass: "bg-white/70 border-slate-200/60 backdrop-blur-xl text-slate-900 shadow-2xl shadow-slate-200/50",
      "glass-light": "bg-white/40 border-slate-100/50 backdrop-blur-md text-slate-600 shadow-inner",
      accent: "bg-brand-blue/5 border-brand-blue/10 text-slate-900 shadow-[0_0_30px_rgba(21,72,157,0.05)]",
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl border transition-all duration-300 ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 border-b border-slate-100 ${className}`} {...props} />
);

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-display font-black text-slate-900 tracking-tight ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props} />
);

export const CardFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 border-t border-slate-100 flex items-center ${className}`} {...props} />
);
