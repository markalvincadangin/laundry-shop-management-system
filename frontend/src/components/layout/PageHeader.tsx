import React from "react";
import { PageHeaderProps } from "@/types/components";

export function PageHeader({ title, subtitle, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-grid-6 mb-grid-8 print:hidden">
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
