"use client";

import React from "react";
import { DollarSign, Check, Navigation } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { Card, Button } from "@/components/ui";
import { useRates } from "@/hooks/useRates";

export function PricingSection() {
  const { rates, loading: ratesLoading } = useRates();

  const primaryRate =
    rates.find((r) => r.isActive && r.serviceName?.toLowerCase().includes("standard")) ||
    rates.find((r) => r.isActive);
  const displayPrice = primaryRate?.basePricePerLoad ?? 140;
  const displayWeight = primaryRate?.kgLimitPerLoad ?? 8;

  return (
    <section className="py-grid-24 bg-brand-blue/5 border-y border-brand-blue/10">
      <div className="container mx-auto px-grid-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-grid-20 items-center">
          
          <div className="lg:col-span-7 space-y-grid-8 text-left">
            <div className="space-y-grid-6">
              <div className="inline-flex items-center gap-grid-3 px-grid-4 py-grid-1.5 bg-brand-blue/10 rounded-full text-brand-blue">
                <DollarSign className="h-4 w-4" />
                <span className="text-caption font-bold uppercase tracking-widest">
                  {UI_LABELS.portal.landing.PRICING_TITLE}
                </span>
              </div>
              <h2 className="text-h1 font-black font-display text-slate-900 uppercase tracking-tighter leading-[1.1]">
                {UI_LABELS.portal.landing.PRICING_H1}
              </h2>
              <p className="text-body font-medium text-slate-500 max-w-lg leading-relaxed">
                {ratesLoading
                  ? "Fetching latest rates..."
                  : `We keep it simple. ${UI_LABELS.units.PRICE_SYMBOL}${displayPrice} covers a standard ${displayWeight} kg basket—perfect for your weekly wash.`}
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-grid-6 pt-grid-4">
              {[
                UI_LABELS.portal.landing.PRICING_ITEM_1,
                UI_LABELS.portal.landing.PRICING_ITEM_2,
                UI_LABELS.portal.landing.PRICING_ITEM_3,
                UI_LABELS.portal.landing.PRICING_ITEM_4,
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-grid-3 text-slate-700 font-bold text-sm">
                  <div className="h-5 w-5 bg-emerald-50 rounded-md flex items-center justify-center shrink-0 border border-emerald-100">
                    <Check className="h-3 w-3 text-emerald-700" strokeWidth={3} />
                  </div>
                  {i === 0
                    ? `Up to ${displayWeight}kg per load`
                    : i === 2
                    ? `Strict ${displayWeight}kg Limit per Machine Load`
                    : item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 relative">
            <Card className="p-grid-10 bg-white border-brand-blue/10 shadow-xl rounded-[2.5rem] text-center space-y-grid-8 relative overflow-hidden group border-none">
              <div className="space-y-grid-2 pt-grid-4">
                <span className="text-caption font-black text-slate-400 uppercase tracking-widest">
                  {UI_LABELS.portal.landing.PRICING_CARD_TITLE}
                </span>
                <div className="flex items-baseline justify-center gap-grid-2">
                  <span className="text-4xl font-black text-slate-900 mb-2 opacity-60">
                    {UI_LABELS.units.PRICE_SYMBOL}
                  </span>
                  <span
                    className={`text-display sm:text-8xl font-black font-display text-brand-blue tracking-tighter transition-all duration-500 ${
                      ratesLoading ? "opacity-20 animate-pulse" : "opacity-100"
                    }`}
                  >
                    {displayPrice}
                  </span>
                </div>
                <p className="text-body-sm font-bold text-slate-500 uppercase tracking-widest">
                  {ratesLoading
                    ? "Loading Current Rates..."
                    : `Per ${displayWeight}${UI_LABELS.shared.units.WEIGHT.toLowerCase()} load`}
                </p>
              </div>
              <div className="h-px w-full bg-slate-100" />

              <a
                href="https://maps.app.goo.gl/ctSVqEZMKfA53JQi8"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full h-14 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-md transition-all gap-grid-3">
                  {UI_LABELS.portal.landing.VISIT_US}
                  <Navigation className="h-4 w-4" />
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
