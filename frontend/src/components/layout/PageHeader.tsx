import React from "react";
import { motion } from "framer-motion";
import { PageHeaderProps } from "@/types/components";

/**
 * PageHeader — High Fidelity — v5.0
 * Standardized header for all dashboard pages.
 * Supports 'premium' variant with glassmorphism, 2.5rem radius, and animated glows.
 * v4.0 Consistency Pass: Standardized radius and enhanced visual depth.
 */
export function PageHeader({ title, subtitle, icon: Icon, actions, className, variant = "default" }: PageHeaderProps) {
  if (variant === "premium") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-md shadow-slate-200/20 p-grid-8 md:p-grid-10 mb-grid-12 ${className || ""}`}
      >


        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-grid-8">
          <div className="flex items-center gap-grid-8">
            {Icon && (
              <div className="h-20 w-20 rounded-[28px] bg-white shadow-xl shadow-brand-blue/5 border-2 border-slate-50 flex items-center justify-center transition-all duration-500 hover:scale-105 hover:rotate-3 group">
                <Icon className="h-10 w-10 text-brand-blue transition-transform group-hover:scale-110" strokeWidth={2.5} />
              </div>
            )}
            <div className="space-y-grid-2">
              <h1 className="text-display md:text-5xl text-slate-900 tracking-tighter leading-none font-black">
                {title}
              </h1>
              {subtitle && (
                <p className="text-body-sm font-black text-slate-400 uppercase tracking-[0.25em] opacity-80 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-grid-4">
              {actions}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-grid-6 mb-grid-10 print:hidden ${className || ""}`}>
      <div className="space-y-grid-2">
        <h1 className="text-display md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-grid-4">
          {Icon && (
            <div className="h-12 w-12 rounded-xl bg-brand-blue/5 flex items-center justify-center border border-brand-blue/10">
              <Icon className="h-7 w-7 text-brand-blue" />
            </div>
          )}
          {title}
        </h1>
        {subtitle && (
          <p className="text-body-sm text-slate-500 font-black uppercase tracking-[0.2em] opacity-70">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-grid-4">
          {actions}
        </div>
      )}
    </div>
  );
}
