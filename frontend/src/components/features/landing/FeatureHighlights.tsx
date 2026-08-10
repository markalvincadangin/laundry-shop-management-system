"use client";

import { Package, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

export function FeatureHighlights() {
  const features = [
    {
      icon: Package,
      title: UI_LABELS.portal.landing.HIGHLIGHTS.REALTIME_TRACKING_TITLE,
      desc: UI_LABELS.portal.landing.HIGHLIGHTS.REALTIME_TRACKING_DESC,
    },
    {
      icon: ShieldCheck,
      title: UI_LABELS.portal.landing.HIGHLIGHTS.SAFE_SECURE_TITLE,
      desc: UI_LABELS.portal.landing.HIGHLIGHTS.SAFE_SECURE_DESC,
    },
    {
      icon: Clock,
      title: UI_LABELS.portal.landing.HIGHLIGHTS.FAST_TURNAROUND_TITLE,
      desc: UI_LABELS.portal.landing.HIGHLIGHTS.FAST_TURNAROUND_DESC,
    },
    {
      icon: Sparkles,
      title: UI_LABELS.portal.landing.HIGHLIGHTS.CUSTOMER_FIRST_TITLE,
      desc: UI_LABELS.portal.landing.HIGHLIGHTS.CUSTOMER_FIRST_DESC,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/50">
      {features.map((f, idx) => (
        <div
          key={idx}
          className="p-3 bg-white/80 sm:bg-white/60 backdrop-blur-xs rounded-xl border border-slate-200/60 sm:border-slate-100/80 space-y-1 text-left hover:bg-white hover:shadow-xs transition-all"
        >
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-50/70 text-brand-blue flex items-center justify-center border border-blue-100/40 shrink-0">
            <f.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-900 tracking-tight leading-snug">{f.title}</h3>
          <p className="text-[8.5px] sm:text-[9px] font-medium text-slate-500 leading-normal">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
