"use client";

import { EmptyStateProps } from "@/types/components";

/**
 * Friendly empty state for tables and lists.
 */
export function EmptyState({
  title,
  description,
  icon,
  iconAriaLabel,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center ${compact ? 'py-10 px-4' : 'py-20 px-8'}`}>
      {icon ? (
        <div
          className="mb-4 text-brand-blue"
          {...(iconAriaLabel
            ? { role: "img", "aria-label": iconAriaLabel }
            : { "aria-hidden": true })}
        >
          {icon}
        </div>
      ) : (
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-brand-blue/10 blur-2xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className={`relative z-10 flex items-center justify-center rounded-3xl bg-white border border-slate-200 shadow-xl text-brand-blue ${compact ? 'h-16 w-16' : 'h-24 w-24'}`} aria-hidden="true">
            <svg className={compact ? "h-8 w-8" : "h-12 w-12"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
      )}
      <h3 className={`font-display font-black text-slate-900 tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-sm font-medium text-slate-500 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
