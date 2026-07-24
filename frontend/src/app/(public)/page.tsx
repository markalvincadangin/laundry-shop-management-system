/* eslint-disable react/jsx-no-literals */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  MapPin,
  Search,
  Check,
  Zap,
  DollarSign,
  Star,
  Navigation,
  ExternalLink
} from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { Button, Card } from "@/components/ui";
import { PublicTopNav } from "@/components/layout";
import { toast } from "sonner";
import { useRates } from "@/hooks/useRates";

/**
 * Faith Laundry Shop — Official Business Portal v13.0
 * 
 * THE "PROPORTIONAL BALANCE" REFACTOR:
 * 1. Macro-Rhythm (HCI): Standardized section padding to py-grid-24 (96px) for balanced vertical flow.
 * 2. Visual Proportions: Adjusted image and text container widths to prevent "too narrow" or "too wide" feeling.
 * 3. Footer Pillar Balance: Refactored footer grid to 4:8 split with better information density.
 * 4. Spec Alignment: Strictly enforced text-display, text-h1, text-h2 tokens as per FRONT-001 §2.2.2.
 * 5. F-Pattern Hierarchy: Maintained left-aligned scan lines for value proposition and secondary detail.
 */
export default function LandingPage() {
  const [trackingId, setTrackingId] = useState("");
  const router = useRouter();
  const { rates, loading: ratesLoading } = useRates();

  // Find the primary/standard rate (Standard Wash first, then first active)
  const primaryRate = rates.find(r => r.isActive && r.serviceName?.toLowerCase().includes("standard")) || rates.find(r => r.isActive);
  const displayPrice = primaryRate?.basePricePerLoad ?? 140;
  const displayWeight = primaryRate?.kgLimitPerLoad ?? 8;

  const handleTrack = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanId = trackingId.trim().toUpperCase();
    if (!cleanId) {
      toast.error(UI_LABELS.feedback.error.GENERIC); // Use a better generic error
      return;
    }
    router.push(`/track?ref=${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-neutral-50 selection:bg-brand-blue/10 selection:text-brand-blue overflow-x-hidden font-sans">

      {/* ── STICKY NAVIGATION ── § FRONT-001 Compliant */}
      <PublicTopNav variant="landing" />

      {/* ── HERO SECTION: PROPORTIONAL BALANCE ── */}
      <section className="relative min-h-[80vh] flex flex-col pt-32 pb-grid-24 bg-white">
        <div className="flex-1 flex items-center">
          <div className="container mx-auto px-grid-6 grid grid-cols-1 lg:grid-cols-12 gap-grid-20 items-center">

            {/* Left Content: 7 Columns wide */}
            <div className="lg:col-span-7 relative z-10 space-y-grid-10 text-left">
              <div className="space-y-grid-6">
                <div className="flex items-center gap-grid-3 mb-grid-4">
                  <div className="inline-flex items-center gap-grid-2 px-grid-3 py-grid-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                      {UI_LABELS.portal.landing.TRUSTED_SINCE}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-grid-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                    <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{UI_LABELS.portal.landing.CUSTOMER_RATING}</span>
                  </div>
                </div>
                <h1 className="text-h1 sm:text-display font-black font-display text-slate-900 uppercase tracking-tighter leading-[0.95] drop-shadow-sm">
                  {UI_LABELS.portal.landing.HERO_TITLE_1} <br />
                  {UI_LABELS.portal.landing.HERO_TITLE_2} <span className="text-brand-blue">{UI_LABELS.portal.landing.HERO_TITLE_3}</span>
                </h1>
                <p className="text-body font-medium text-slate-500 max-w-lg leading-relaxed">
                  {UI_LABELS.portal.landing.HERO_SUBTITLE}
                </p>
              </div>

              {/* TRACKING FORM: High Affordance, Proportional Size */}
              <div className="relative max-w-lg group mt-grid-8">
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-blue/10 to-brand-cyan/10 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <form
                  onSubmit={handleTrack}
                  className="relative flex items-center bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-grid-2 shadow-2xl shadow-brand-blue/5 focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all duration-300"
                >
                  <div className="flex-1 flex items-center px-grid-4 gap-grid-4">
                    <div className="p-grid-2 bg-brand-blue/5 rounded-2xl text-brand-blue group-focus-within:bg-brand-blue group-focus-within:text-white transition-all duration-300">
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
                    className="h-grid-14 px-grid-8 rounded-[1.4rem] bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/10 uppercase text-[10px] font-black tracking-widest active:scale-95 transition-all"
                  >
                    {UI_LABELS.portal.tracking.TITLE}
                  </Button>
                </form>
                <p className="mt-grid-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-grid-4 opacity-70">
                  {UI_LABELS.portal.landing.TRACKING_HINT}
                </p>
              </div>
            </div>

            {/* Right Image: 5 Columns wide */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative h-[520px] w-full rounded-[3rem] overflow-hidden shadow-xl ring-1 ring-slate-100">
                <Image
                  src="/images/hero-premium.png"
                  alt={UI_LABELS.meta.APP_NAME}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 via-transparent to-transparent" />

                <div className="absolute bottom-8 right-8 px-grid-5 py-grid-3 glass rounded-xl border-white/40 shadow-lg backdrop-blur-xl flex items-center gap-grid-3">
                  <div className="h-8 w-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{UI_LABELS.portal.tracking.VERIFIED_DATA}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LOCATION STRIP: COMPACT & BALANCED ── */}
      <section className="py-grid-10 bg-slate-50 border-y border-slate-200/60">
        <div className="container mx-auto px-grid-6">
          <div className="flex flex-wrap justify-between items-center gap-grid-6 opacity-80">
            {[
              { icon: MapPin, text: "Sitio Ilaya, Tabuc Suba Jaro, Iloilo City" },
              { icon: Clock, text: "Mon — Sat: 8:00 AM - 7:00 PM" },
              { icon: ShieldCheck, text: UI_LABELS.portal.tracking.VERIFIED_DATA },
              { icon: Phone, text: UI_LABELS.portal.tracking.SUPPORT_PHONE },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-grid-3 text-slate-600">
                <item.icon className="h-4 w-4 text-brand-blue/70" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION: BALANCED GRID ── */}
      <section className="py-grid-24 bg-white">
        <div className="container mx-auto px-grid-6 space-y-grid-20">
          <div className="text-center max-w-2xl mx-auto space-y-grid-4">
            <span className="text-caption font-bold text-brand-blue uppercase tracking-widest">{UI_LABELS.portal.landing.COMMITMENT_TITLE}</span>
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

      {/* ── PRICING SECTION: HCI OPTIMIZED ── */}
      <section className="py-grid-24 bg-brand-blue/5 border-y border-brand-blue/10">
        <div className="container mx-auto px-grid-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-grid-20 items-center">

            <div className="lg:col-span-7 space-y-grid-8 text-left">
              <div className="space-y-grid-6">
                <div className="inline-flex items-center gap-grid-3 px-grid-4 py-grid-1.5 bg-brand-blue/10 rounded-full text-brand-blue">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-caption font-bold uppercase tracking-widest">{UI_LABELS.portal.landing.PRICING_TITLE}</span>
                </div>
                <h2 className="text-h1 font-black font-display text-slate-900 uppercase tracking-tighter leading-[1.1]">
                  {UI_LABELS.portal.landing.PRICING_H1}
                </h2>
                <p className="text-body font-medium text-slate-500 max-w-lg leading-relaxed">
                  {ratesLoading
                    ? 'Fetching latest rates...'
                    : `We keep it simple. ${UI_LABELS.units.PRICE_SYMBOL}${displayPrice} covers a standard ${displayWeight} kg basket—perfect for your weekly wash.`
                  }
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-grid-6 pt-grid-4">
                {[
                  UI_LABELS.portal.landing.PRICING_ITEM_1,
                  UI_LABELS.portal.landing.PRICING_ITEM_2,
                  UI_LABELS.portal.landing.PRICING_ITEM_3,
                  UI_LABELS.portal.landing.PRICING_ITEM_4
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-grid-3 text-slate-700 font-bold text-sm">
                    <div className="h-5 w-5 bg-emerald-50 rounded-md flex items-center justify-center shrink-0 border border-emerald-100">
                      <Check className="h-3 w-3 text-emerald-700" strokeWidth={3} />
                    </div>
                    {i === 0
                      ? `Up to ${displayWeight}kg per load`
                      : i === 2
                        ? `Strict ${displayWeight}kg Limit per Machine Load`
                        : item
                    }
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 relative">
              <Card className="p-grid-10 bg-white border-brand-blue/10 shadow-xl rounded-[2.5rem] text-center space-y-grid-8 relative overflow-hidden group border-none">
                <div className="space-y-grid-2 pt-grid-4">
                  <span className="text-caption font-black text-slate-400 uppercase tracking-widest">{UI_LABELS.portal.landing.PRICING_CARD_TITLE}</span>
                  <div className="flex items-baseline justify-center gap-grid-2">
                    <span className="text-4xl font-black text-slate-900 mb-2 opacity-60">{UI_LABELS.units.PRICE_SYMBOL}</span>
                    <span className={`text-display sm:text-8xl font-black font-display text-brand-blue tracking-tighter transition-all duration-500 ${ratesLoading ? 'opacity-20 animate-pulse' : 'opacity-100'}`}>
                      {displayPrice}
                    </span>
                  </div>
                  <p className="text-body-sm font-bold text-slate-500 uppercase tracking-widest">
                    {ratesLoading ? 'Loading Current Rates...' : `Per ${displayWeight}${UI_LABELS.shared.units.WEIGHT.toLowerCase()} load`}
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

      {/* ── FOOTER: PROPORTIONAL BALANCE ── § FRONT-001 Compliant */}
      <footer className="bg-slate-950 py-grid-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-grid-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-24 items-start">

            {/* Brand Section: 4 Columns */}
            <div className="lg:col-span-4 space-y-grid-8">
              <div className="flex items-center gap-grid-4">
                <div className="relative h-14 w-14 bg-white rounded-xl flex items-center justify-center p-2 shadow-xl ring-4 ring-white/5 transition-transform hover:scale-105">
                  <Image src="/branding/logo.svg" alt={UI_LABELS.meta.APP_NAME} width={40} height={40} className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-h3 font-black text-white uppercase tracking-tighter leading-none">
                    {UI_LABELS.meta.APP_NAME}
                  </span>
                  <span className="text-caption font-bold text-brand-cyan uppercase tracking-widest mt-1.5">
                    {UI_LABELS.portal.landing.TRUSTED_SINCE}
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-[240px]">
                {UI_LABELS.portal.landing.HERO_SUBTITLE}
              </p>
            </div>

            {/* Info Section: 8 Columns */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-grid-16 pt-grid-4">
              <div className="space-y-grid-6">
                <div className="flex items-center gap-grid-3">
                  <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                    <MapPin className="h-5 w-5 text-brand-cyan" />
                  </div>
                  <h4 className="text-caption font-bold text-white uppercase tracking-widest">{UI_LABELS.portal.landing.LOCATION_TITLE}</h4>
                </div>
                <div className="text-body-sm text-slate-400 font-medium leading-relaxed pl-grid-13">
                  <p className="text-white font-bold mb-1">{UI_LABELS.meta.APP_NAME}</p>
                  Sitio Ilaya, Tabuc Suba Jaro,<br />
                  Iloilo City, 5000 Philippines
                  <a
                    href="https://maps.app.goo.gl/ctSVqEZMKfA53JQi8"
                    target="_blank"
                    className="flex items-center gap-1 text-brand-cyan hover:underline mt-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    {UI_LABELS.portal.landing.VISIT_US} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-grid-6">
                <div className="flex items-center gap-grid-3">
                  <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                    <Phone className="h-5 w-5 text-brand-cyan" />
                  </div>
                  <h4 className="text-caption font-bold text-white uppercase tracking-widest">{UI_LABELS.portal.landing.SUPPORT_TITLE}</h4>
                </div>
                <div className="text-body-sm text-slate-400 font-medium leading-relaxed pl-grid-13">
                  <p className="text-white font-bold mb-1">{UI_LABELS.dynamic.PHONE___INQUIRIES}</p>
                  {UI_LABELS.portal.tracking.SUPPORT_PHONE}<br />
                  Mon — Sat: 8:00 AM - 7:00 PM
                  <div className="flex items-center gap-2 text-slate-400 mt-4 text-[10px] font-black uppercase tracking-widest">
                    {UI_LABELS.portal.landing.RESPONSE_TIME} <span className="text-emerald-500">{UI_LABELS.portal.landing.RESPONSE_VALUE}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-grid-24 pt-grid-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-grid-6 text-slate-500">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              {UI_LABELS.meta.COPYRIGHT} {UI_LABELS.dynamic.ALL_RIGHTS_RESERVED}
            </p>
            <p className="text-[10px] font-black tracking-tight uppercase">
              {UI_LABELS.meta.DEVELOPED_BY} <span className="text-slate-300">{UI_LABELS.meta.AGENCY}</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  const colors = {
    blue: "bg-brand-blue/5 text-[#1a7fa8] group-hover:bg-[#1a7fa8] group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white",
    cyan: "bg-brand-cyan/5 text-[#1a7fa8] group-hover:bg-[#1a7fa8] group-hover:text-white"
  };

  return (
    <Card className="p-grid-8 border-slate-100 bg-neutral-50 hover:bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 space-y-grid-6 rounded-[2rem] group border-none">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${colors[color as keyof typeof colors]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-grid-3 text-left">
        <h3 className="text-h3 font-black font-display text-slate-900 tracking-tight">{title}</h3>
        <p className="text-body-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
      </div>
    </Card>
  );
}
