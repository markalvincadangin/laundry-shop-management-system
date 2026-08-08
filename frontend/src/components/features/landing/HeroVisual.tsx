"use client";

import Image from "next/image";
import { UI_LABELS } from "@/constants/ui";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[580px] lg:max-w-[760px]">
      {/* Subtle Cyan Radial Glow behind visual */}
      <div className="absolute -inset-4 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(48,168,212,0.10),_transparent_70%)] blur-2xl pointer-events-none" />

      {/* Frame Container with 28px/32px border radius, border, and elevation */}
      <div className="relative overflow-hidden rounded-[28px] lg:rounded-[32px] border border-slate-200/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)] group">
        <Image
          src="/images/landing/hero-dashboard.png"
          alt={`${UI_LABELS.meta.SHOP_NAME} management system`}
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 760px"
          className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </div>
    </div>
  );
}
