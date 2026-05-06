import React from "react";
import { motion } from "framer-motion";
import { PageHeaderProps } from "@/types/components";

/**
 * PageHeader — High Fidelity (v4.0)
 * Standardized header for all dashboard pages.
 * Supports 'premium' variant with glassmorphism and animated glows.
 */
export function PageHeader({ title, subtitle, icon: Icon, actions, className, variant = "default" }: PageHeaderProps) {
  if (variant === "premium") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-grid-6 md:p-grid-8 shadow-sm mb-grid-10 ${className || ""}`}
      >
        {/* Glow Blobs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl opacity-60" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-grid-6">
          <div className="flex items-center gap-grid-6">
            {Icon && (
              <div className="h-16 w-16 rounded-2xl bg-white/80 shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
                <Icon className="h-8 w-8 text-brand-blue" />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-display md:text-[32px] text-slate-900 tracking-tight leading-none font-black">
                {title}
              </h1>
              {subtitle && (
                <p className="text-body-sm font-black text-slate-500 uppercase tracking-[0.2em] opacity-80 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-grid-3">
              {actions}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-grid-6 mb-grid-8 print:hidden ${className || ""}`}>
      <div className="space-y-grid-1.5">
        <h1 className="text-display font-black tracking-tight text-slate-900 flex items-center gap-grid-3">
          {Icon && <Icon className="h-grid-8 w-grid-8 text-brand-blue" />}
          {title}
        </h1>
        {subtitle && (
          <p className="text-body text-slate-500 font-bold uppercase tracking-widest opacity-80">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-grid-3">
          {actions}
        </div>
      )}
    </div>
  );
}
