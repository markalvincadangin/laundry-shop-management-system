import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

import { SectionHeaderProps } from "@/types/components";

/**
 * Standardized Section Header
 * Features the signature blue vertical bar and uppercase font-black typography.
 */
export function SectionHeader({ title, viewAllHref, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-8 w-1.5 bg-brand-blue rounded-full shadow-[0_0_12px_rgba(21,72,157,0.3)]" />
        <h2 className="text-xl font-display font-black text-slate-900 tracking-tight uppercase">
          {title}
        </h2>
      </div>
      
      {viewAllHref && (
        <Link 
          href={viewAllHref} 
          className="text-xs font-black text-slate-400 hover:text-brand-blue flex items-center gap-2 transition-all uppercase tracking-[0.2em] group"
        >
          {UI_LABELS.shared.buttons.VIEW_ALL}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
