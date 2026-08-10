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
    <nav className="fixed top-0 left-0 right-0 z-[100] h-20 bg-white/95 backdrop-blur-2xl border-b border-slate-200/60 flex items-center px-4 sm:px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 transition-all duration-500 group-hover:scale-110 shrink-0">
            <Image
              src="/assets/app-icon/app-icon.svg"
              alt={UI_LABELS.meta.SHOP_NAME}
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-h3 font-black font-display text-brand-blue tracking-tight uppercase leading-none group-hover:opacity-80 transition-opacity duration-300 whitespace-nowrap">
              {UI_LABELS.meta.SHOP_NAME}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-700" />
              </span>
              <p className="text-[8.5px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">
                {variant === "landing" ? UI_LABELS.portal.topnav.OFFICIAL_WEBSITE : UI_LABELS.portal.tracking.TITLE}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          {variant === "landing" && (
            <>
              <Link 
                href="/track" 
                className="hidden sm:block text-caption font-bold text-slate-600 hover:text-brand-blue transition-colors uppercase tracking-wider px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                {UI_LABELS.layout.nav.TRACK_ORDER}
              </Link>
              <div className="hidden sm:block h-4 w-px bg-slate-200" />
              <Link 
                href="/login" 
                className="flex items-center gap-1.5 text-[10px] sm:text-caption font-bold text-white sm:text-slate-600 bg-brand-blue sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl sm:rounded-none hover:text-brand-blue transition-colors uppercase tracking-wider shadow-sm sm:shadow-none active:scale-95"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{UI_LABELS.layout.nav.STAFF_LOGIN}</span>
              </Link>
            </>
          )}
          {variant === "tracking" && (
            <Link 
              href="/login" 
              className="flex items-center gap-1.5 text-[10px] sm:text-caption font-bold text-white sm:text-slate-600 bg-brand-blue sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl sm:rounded-none hover:text-brand-blue transition-colors uppercase tracking-wider shadow-sm sm:shadow-none active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{UI_LABELS.layout.nav.STAFF_LOGIN}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
