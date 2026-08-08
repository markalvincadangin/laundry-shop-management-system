"use client";

import React from "react";
import { Zap, Sparkles, CheckCircle2, LucideIcon } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { Card } from "@/components/ui";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: "blue" | "emerald" | "cyan";
}

function FeatureCard({ icon: Icon, title, desc, color }: FeatureCardProps) {
  const colors = {
    blue: "bg-brand-blue/5 text-[#1a7fa8] group-hover:bg-[#1a7fa8] group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white",
    cyan: "bg-brand-cyan/5 text-[#1a7fa8] group-hover:bg-[#1a7fa8] group-hover:text-white",
  };

  return (
    <Card className="p-grid-8 border-slate-100 bg-neutral-50 hover:bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 space-y-grid-6 rounded-[2rem] group border-none">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-grid-3 text-left">
        <h3 className="text-h3 font-black font-display text-slate-900 tracking-tight">{title}</h3>
        <p className="text-body-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
      </div>
    </Card>
  );
}

export function CommitmentFeatures() {
  return (
    <section className="py-grid-24 bg-white">
      <div className="container mx-auto px-grid-6 space-y-grid-20">
        <div className="text-center max-w-2xl mx-auto space-y-grid-4">
          <span className="text-caption font-bold text-brand-blue uppercase tracking-widest">
            {UI_LABELS.portal.landing.COMMITMENT_TITLE}
          </span>
          <h2 className="text-h1 font-black font-display text-slate-900 uppercase tracking-tighter leading-[1.1]">
            {UI_LABELS.portal.landing.COMMITMENT_H1}
          </h2>
          <p className="text-body font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
            {UI_LABELS.portal.landing.COMMITMENT_DESC}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={Zap}
            title={UI_LABELS.portal.landing.FEATURES.LIVE_UPDATES}
            desc={UI_LABELS.portal.landing.FEATURES.LIVE_UPDATES_DESC}
            color="blue"
          />
          <FeatureCard
            icon={Sparkles}
            title={UI_LABELS.portal.landing.FEATURES.DEDICATED_LOADS}
            desc={UI_LABELS.portal.landing.FEATURES.DEDICATED_LOADS_DESC}
            color="emerald"
          />
          <FeatureCard
            icon={CheckCircle2}
            title={UI_LABELS.portal.landing.FEATURES.DIGITAL_ACCOUNTABILITY}
            desc={UI_LABELS.portal.landing.FEATURES.DIGITAL_ACCOUNTABILITY_DESC}
            color="cyan"
          />
        </div>
      </div>
    </section>
  );
}
