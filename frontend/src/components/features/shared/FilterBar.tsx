import React from "react";
import { FilterBarProps } from "@/types/components";
import { motion } from "framer-motion";

/**
 * FilterBar Molecule — v5.0
 * Standardized container for registry filters.
 * Hardened with premium shadows and consistent spacing tokens.
 */
export function FilterBar({ children, title }: FilterBarProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/30 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/40"
    >
      {title && (
        <div className="px-grid-8 py-grid-3 border-b border-slate-100 bg-slate-50/40">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            {title}
          </h3>
        </div>
      )}
      <div className="p-grid-8 flex flex-wrap items-end gap-grid-4">
        {children}
      </div>
    </motion.div>
  );
}
