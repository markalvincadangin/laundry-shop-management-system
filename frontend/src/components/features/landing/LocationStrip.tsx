"use client";

import React from "react";
import { MapPin, Clock, ShieldCheck, Phone } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

export function LocationStrip() {
  const items = [
    { icon: MapPin, text: "Sitio Ilaya, Tabuc Suba Jaro, Iloilo City" },
    { icon: Clock, text: "Mon — Sat: 8:00 AM - 7:00 PM" },
    { icon: ShieldCheck, text: UI_LABELS.portal.tracking.VERIFIED_DATA },
    { icon: Phone, text: UI_LABELS.portal.tracking.SUPPORT_PHONE },
  ];

  return (
    <section className="py-grid-10 bg-slate-50 border-y border-slate-200/60">
      <div className="container mx-auto px-grid-6">
        <div className="flex flex-wrap justify-between items-center gap-grid-6 opacity-80">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-grid-3 text-slate-600">
              <item.icon className="h-4 w-4 text-brand-blue/70" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
