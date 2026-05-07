"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

interface PublicTopNavProps {
  variant?: "landing" | "tracking";
}

/**
 * PublicTopNav — Shared navigation for the public-facing portal.
 * Aligned with FRONT-001 v3.3.1 (Consistency) and FRONT-002 (Organization).
 */
export function PublicTopNav({ variant = "landing" }: PublicTopNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-20 bg-white/95 backdrop-blur-2xl border-b border-slate-200/60 flex items-center px-grid-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-grid-4 group">
          <div className="relative h-12 w-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand-blue/10">
            <Image
              src="/branding/logo.svg"
              alt={UI_LABELS.meta.APP_NAME}
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-h3 font-black font-display text-brand-blue tracking-tighter uppercase leading-none group-hover:opacity-80 transition-opacity duration-300">
              {UI_LABELS.meta.APP_NAME}
            </h1>
            <div className="flex items-center gap-grid-2 mt-grid-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-700" />
              </span>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">
                {variant === "landing" ? UI_LABELS.meta.APP_TAGLINE : UI_LABELS.portal.tracking.TITLE}
              </p>
            </div>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-grid-8 h-full">
          {variant === "landing" && (
            <>
              <Link 
                href="/track" 
                className="text-caption font-bold text-slate-600 hover:text-brand-blue transition-colors uppercase tracking-widest"
              >
                {UI_LABELS.layout.nav.TRACK_ORDER}
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <Link 
                href="/login" 
                className="flex items-center gap-2 text-caption font-bold text-slate-600 hover:text-brand-blue transition-colors uppercase tracking-widest"
              >
                <LogIn className="h-3.5 w-3.5" />
                {UI_LABELS.layout.nav.STAFF_LOGIN}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
