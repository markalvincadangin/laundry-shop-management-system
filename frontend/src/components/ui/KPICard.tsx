"use client";

import React from "react";
import { Card } from "./Card";
import { UI_LABELS } from "@/constants/ui";
import { KPICardProps } from "@/types/components";
import { motion } from "framer-motion";

/**
 * KPICard — High-impact metric display for dashboard and registries.
 * FRONT-001 §5.3, §11.2.
 *
 * v3.0 additions:
 *  - onClick prop: makes the card an interactive target (e.g. "Ready for Pickup" scrolls pipeline).
 *    When provided, renders as a <button> with cursor-pointer + hover:ring-2 focus treatment.
 *    Meets 44px min touch target via the existing p-grid-8 padding.
 */
export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  pulse = false,
  onClick,
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
    ? "cursor-pointer hover:translate-y-[-4px] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:ring-offset-2"
    : "";

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        variant="glass"
        className={`group relative h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-300/40 border-slate-200/50 ${interactiveClasses}`}
      >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
      
      <div className="relative p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          {Icon && (
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 shadow-sm ${variantStyles[variant]}`}>
              <Icon className="h-6 w-6" strokeWidth={2.5} />
            </div>
          )}
          {pulse && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/8 border border-brand-blue/20 backdrop-blur-sm shadow-sm shadow-brand-blue/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-blue">
                {UI_LABELS.shared.common.LIVE}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-slate-500 transition-colors">
            {title}
          </p>
          <div className="flex items-baseline gap-3">
            <div className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight flex items-center gap-1">
              {value}
            </div>
            {subtitle && (
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Decorative highlight line (HCI: visual progress indicator) */}
        <div className="relative h-1.5 w-full bg-slate-100/50 rounded-full overflow-hidden border border-slate-200/20">
          <div className={`absolute top-0 left-0 h-full w-8 transition-all duration-700 group-hover:w-full ease-out ${accentColors[variant]}`} />
        </div>
      </div>
    </Card>
  </motion.div>
  );

  // Wrap in button when onClick is provided for semantic accessibility + keyboard support
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left rounded-[inherit] focus:outline-none"
        aria-label={`${title}: ${value}. Click to highlight in pipeline.`}
      >
        {content}
      </button>
    );
  }

  return content;
}

/**
 * KPICardSkeleton — Loading state for KPICards.
 */
export function KPICardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-slate-200/50 bg-slate-50/50 p-8 space-y-6 animate-pulse">
      <div className="h-12 w-12 rounded-2xl bg-slate-200" />
      <div className="space-y-3">
        <div className="h-2 w-24 bg-slate-200 rounded" />
        <div className="h-10 w-32 bg-slate-300 rounded" />
      </div>
      <div className="h-1.5 w-full bg-slate-200 rounded-full" />
    </div>
  );
}
