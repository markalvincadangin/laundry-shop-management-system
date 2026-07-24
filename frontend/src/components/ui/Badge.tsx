import React from "react";
import { type VariantProps, cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-grid-2 rounded-full border px-grid-4 py-grid-1.5 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-brand-blue/5 border-brand-blue/10 text-brand-blue",
        success: "bg-emerald-50 border-emerald-100 text-emerald-700",
        warning: "bg-amber-50 border-amber-100 text-amber-700",
        error: "bg-rose-50 border-rose-100 text-rose-700",
        rush: "bg-rose-600 border-rose-700 text-white shadow-lg shadow-rose-600/20 animate-pulse",
        action: "bg-brand-blue/10 border-brand-blue/20 text-brand-blue shadow-[0_0_15px_rgba(21,72,157,0.08)]",
        neutral: "bg-slate-100/50 border-slate-200 text-slate-500",
        outline: "bg-transparent border-slate-200 text-slate-600",
        custom: "", // Allows overriding with arbitrary classes from constants
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, className })} {...props} />
  );
}
