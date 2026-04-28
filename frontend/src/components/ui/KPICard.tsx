import React from "react";
import { Card } from "./Card";
import { UI_LABELS } from "@/constants/ui";
import { KPICardProps } from "@/types/components";

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
    default: "text-slate-400 bg-neutral-50 border-slate-200",
    accent:  "text-brand-blue bg-brand-blue/5 border-brand-blue/10",
    success: "text-success-700 bg-success-100 border-success-700/10",
    warning: "text-warning-700 bg-warning-100 border-warning-700/10",
  };

  const accentColors = {
    default: "bg-slate-200",
    accent:  "bg-brand-blue",
    success: "bg-success-700",
    warning: "bg-warning-700",
  };

  const interactiveClasses = onClick
    ? "cursor-pointer hover:ring-2 hover:ring-brand-blue/20 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:ring-offset-2"
    : "";

  const content = (
    <Card
      variant="glass"
      className={`group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/60 overflow-hidden ${interactiveClasses}`}
    >
      <div className="p-4 sm:p-grid-8 space-y-4 sm:space-y-grid-6">
        <div className="flex items-center justify-between">
          {Icon && (
            <div className={`p-grid-4 rounded-2xl border transition-all duration-500 group-hover:scale-110 shadow-sm ${variantStyles[variant]}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          {pulse && (
            <div className="flex items-center gap-grid-3 px-3 py-1.5 rounded-full bg-brand-blue/5 border border-brand-blue/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue" />
              </span>
              <span className="text-caption font-black uppercase tracking-widest text-brand-blue">
                {UI_LABELS.shared.common.LIVE}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-grid-1">
          <p className="text-caption font-black uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-grid-2 sm:gap-grid-3">
            <h3 className="text-2xl sm:text-display font-display font-black text-slate-900 tracking-tighter">
              {value}
            </h3>
            {subtitle && (
              <span className="text-caption text-slate-500 font-bold uppercase tracking-tight opacity-80">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Decorative highlight line */}
        <div className="relative h-1.5 w-full bg-neutral-50 rounded-full overflow-hidden border border-slate-100/50 shadow-inner">
          <div className={`absolute top-0 left-0 h-full w-16 transition-all duration-700 group-hover:w-full ${accentColors[variant]}`} />
        </div>
      </div>
    </Card>
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
