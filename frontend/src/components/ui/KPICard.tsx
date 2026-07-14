"use client";

import React from "react";
import { Card } from "./Card";
import { UI_LABELS } from "@/constants/ui";
import { KPICardProps } from "@/types/components";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * KPICard — High-impact metric display for dashboard and registries — v5.0
 * FRONT-001 §5.3, §11.2.
 * Hardened with premium glassmorphism and enhanced container radius (2.5rem).
 */
export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  pulse = false,
  delta,
  onClick,
  className = "",
}: KPICardProps) {
  const variantStyles = {
    default: "text-slate-500 bg-white/40 border-slate-200/60 shadow-inner shadow-white/80",
    accent:  "text-brand-blue bg-brand-blue/8 border-brand-blue/20 shadow-inner shadow-brand-blue/10",
    success: "text-emerald-600 bg-emerald-50/80 border-emerald-500/20 shadow-inner shadow-emerald-400/10",
    warning: "text-amber-600 bg-amber-50/80 border-amber-500/20 shadow-inner shadow-amber-400/10",
  };

  const accentColors = {
    default: "bg-slate-300",
    accent:  "bg-gradient-to-r from-brand-blue to-blue-600",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500",
  };

  const interactiveClasses = onClick
    ? "cursor-pointer hover:translate-y-[-4px] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:ring-offset-0"
    : "";

  const content = (
    <Card
      variant="glass"
      className={`group relative h-full overflow-hidden transition-all duration-500 rounded-2xl border-slate-200/50 shadow-md shadow-slate-200/40 ${interactiveClasses} ${className}`}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
      
      <div className="relative p-grid-8 sm:p-grid-10 space-y-grid-8">
        <div className="flex items-center justify-between">
          {Icon && (
            <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] border-2 transition-all duration-500 group-hover:scale-110 shadow-sm ${variantStyles[variant]}`}>
              <Icon className="h-7 w-7" strokeWidth={2.5} />
            </div>
          )}
          {pulse && (
            <div className="flex items-center gap-grid-2.5 px-grid-4 py-grid-2 rounded-full bg-brand-blue/8 border border-brand-blue/20 backdrop-blur-sm shadow-sm shadow-brand-blue/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-blue">
                {UI_LABELS.shared.common.LIVE}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-grid-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-500 transition-colors">
            {title}
          </p>
          <div className="text-4xl sm:text-5xl font-sans font-black text-slate-900 tracking-tighter flex items-center gap-1 group-hover:scale-[1.02] transition-transform duration-500 origin-left">
            {value}
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity leading-tight max-w-[80%]">
              {subtitle}
            </p>
          )}
          {delta !== undefined && (
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mt-2 ${delta > 0 ? "text-emerald-500" : delta < 0 ? "text-red-500" : "text-slate-400"}`}>
              {delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : delta < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
              {Math.abs(delta).toFixed(1)}{UI_LABELS.dynamic.VS_PREV_PERIOD}
            </div>
          )}
        </div>

        {/* Decorative highlight line (HCI: visual progress indicator) */}
        <div className="relative h-2 w-full bg-slate-100/50 rounded-full overflow-hidden border border-slate-200/20">
          <div className={`absolute top-0 left-0 h-full w-12 transition-all duration-1000 group-hover:w-full ease-out ${accentColors[variant]}`} />
        </div>
      </div>
    </Card>
  );

  const motionWrapper = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {content}
    </motion.div>
  );

  // Wrap in button when onClick is provided for semantic accessibility + keyboard support
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left rounded-2xl focus:outline-none"
        aria-label={`${title}: ${value}. Click for details.`}
      >
        {motionWrapper}
      </button>
    );
  }

  return motionWrapper;
}

/**
 * KPICardSkeleton — Loading state for KPICards.
 */
export function KPICardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-slate-200/50 bg-white/50 p-grid-10 space-y-grid-8 animate-pulse shadow-sm">
      <div className="h-14 w-14 rounded-[20px] bg-slate-100" />
      <div className="space-y-grid-3">
        <div className="h-2 w-24 bg-slate-100 rounded" />
        <div className="h-12 w-32 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full" />
    </div>
  );
}
