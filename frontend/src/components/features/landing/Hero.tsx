"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Star, ArrowRight } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { HeroVisual } from "./HeroVisual";
import { FeatureHighlights } from "./FeatureHighlights";

export function Hero() {
  const [trackingId, setTrackingId] = useState("");
  const router = useRouter();

  const handleTrack = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanId = trackingId.trim().toUpperCase();
    if (!cleanId) {
      toast.error(UI_LABELS.feedback.error.GENERIC);
      return;
    }
    router.push(`/track?ref=${encodeURIComponent(cleanId)}`);
  };

  return (
    <section className="overflow-hidden bg-[#f8fafc] pt-28 pb-6 lg:pt-32 lg:pb-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 relative z-10">
        
        {/* Content (Left Column on Desktop) */}
        <div className="relative z-10 space-y-grid-6 text-left">
          <div className="space-y-grid-4">
            
            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-grid-3 mb-grid-1">
              <div className="inline-flex items-center gap-grid-2 px-grid-3 py-grid-1.5 bg-emerald-50 rounded-full border border-emerald-200/60 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  {UI_LABELS.portal.landing.TRUSTED_SINCE}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50/80 px-grid-3 py-grid-1.5 rounded-full border border-amber-200/50">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1.5 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  {UI_LABELS.portal.landing.CUSTOMER_RATING}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-[2.25rem] sm:text-[3rem] lg:text-[3.35rem] font-black font-display text-slate-900 uppercase tracking-tighter leading-[0.95]">
              {UI_LABELS.portal.landing.HERO_TITLE_1} <br />
              {UI_LABELS.portal.landing.HERO_TITLE_2} <span className="text-[#15489d]">{UI_LABELS.portal.landing.HERO_TITLE_3}</span>
            </h1>
            
            {/* Description */}
            <p className="text-body font-medium text-slate-500 max-w-xl leading-relaxed">
              {UI_LABELS.portal.landing.HERO_SUBTITLE}
            </p>
          </div>

          {/* Tracking Input Form */}
          <div className="relative max-w-xl group">
            <div className="absolute -inset-2 bg-gradient-to-r from-brand-blue/15 to-[#30a8d4]/15 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <form
              onSubmit={handleTrack}
              className="relative flex items-center bg-white border border-slate-200/80 rounded-[2.2rem] p-grid-2 shadow-xl shadow-brand-blue/5 focus-within:ring-2 focus-within:ring-brand-blue/30 transition-all duration-300"
            >
              <div className="flex-1 flex items-center px-grid-4 gap-grid-3">
                <div className="p-grid-2.5 bg-brand-blue/5 rounded-2xl text-[#15489d] group-focus-within:bg-[#15489d] group-focus-within:text-white transition-all duration-300">
                  <Search className="h-grid-5 w-grid-5" strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder={UI_LABELS.portal.tracking.PLACEHOLDER}
                  className="w-full bg-transparent border-none focus:ring-0 text-body font-black text-slate-900 placeholder:text-slate-400 tracking-[0.1em] uppercase"
                />
              </div>
              <Button
                type="submit"
                className="h-grid-14 px-grid-7 rounded-[1.6rem] bg-[#15489d] text-white hover:bg-[#15489d]/90 shadow-lg shadow-brand-blue/20 uppercase text-[10px] font-black tracking-widest active:scale-95 transition-all flex items-center gap-2"
              >
                <span>LAUNDRY TRACKER</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-grid-3 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-grid-4 opacity-80 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#15489d]" />
              {UI_LABELS.portal.landing.TRACKING_HINT}
            </p>
          </div>

          {/* Mobile Only: Hero Visual between Tracker and Benefits */}
          <div className="block lg:hidden my-6">
            <HeroVisual />
          </div>

          {/* Feature Highlights Grid */}
          <FeatureHighlights />

        </div>

        {/* Desktop Only: Hero Visual Column Vertically Centered */}
        <div className="relative hidden lg:block">
          <HeroVisual />
        </div>

      </div>
    </section>
  );
}
