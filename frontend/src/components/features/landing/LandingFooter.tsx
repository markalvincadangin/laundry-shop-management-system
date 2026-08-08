"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 py-grid-24 text-white relative overflow-hidden">
      <div className="container mx-auto px-grid-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-24 items-start">

          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-grid-8">
            <div className="flex items-center gap-grid-4">
              <div className="relative h-14 w-14 bg-white rounded-xl flex items-center justify-center p-2 shadow-xl ring-4 ring-white/5 transition-transform hover:scale-105">
                <Image
                  src="/assets/app-icon/app-icon.svg"
                  alt={UI_LABELS.meta.SHOP_NAME}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-h3 font-black text-white uppercase tracking-tighter leading-none">
                  {UI_LABELS.meta.SHOP_NAME}
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

          {/* Info Section */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-grid-16 pt-grid-4">
            <div className="space-y-grid-6">
              <div className="flex items-center gap-grid-3">
                <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                  <MapPin className="h-5 w-5 text-brand-cyan" />
                </div>
                <h4 className="text-caption font-bold text-white uppercase tracking-widest">
                  {UI_LABELS.portal.landing.LOCATION_TITLE}
                </h4>
              </div>
              <div className="text-body-sm text-slate-400 font-medium leading-relaxed pl-grid-13">
                <p className="text-white font-bold mb-1">{UI_LABELS.meta.SHOP_NAME}</p>
                Sitio Ilaya, Tabuc Suba Jaro,<br />
                Iloilo City, 5000 Philippines
                <a
                  href="https://maps.app.goo.gl/ctSVqEZMKfA53JQi8"
                  target="_blank"
                  rel="noopener noreferrer"
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
                <h4 className="text-caption font-bold text-white uppercase tracking-widest">
                  {UI_LABELS.portal.landing.SUPPORT_TITLE}
                </h4>
              </div>
              <div className="text-body-sm text-slate-400 font-medium leading-relaxed pl-grid-13">
                <p className="text-white font-bold mb-1">{UI_LABELS.dynamic.PHONE___INQUIRIES}</p>
                {UI_LABELS.portal.tracking.SUPPORT_PHONE}<br />
                Mon — Sat: 8:00 AM - 7:00 PM
                <div className="flex items-center gap-2 text-slate-400 mt-4 text-[10px] font-black uppercase tracking-widest">
                  {UI_LABELS.portal.landing.RESPONSE_TIME}{" "}
                  <span className="text-emerald-500">{UI_LABELS.portal.landing.RESPONSE_VALUE}</span>
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
  );
}
