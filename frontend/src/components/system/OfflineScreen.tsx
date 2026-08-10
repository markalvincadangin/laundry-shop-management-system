"use client";

import React from "react";
import Image from "next/image";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { Button, MeshBackground } from "@/components/ui";

type OfflineScreenProps = {
  onRetry: () => void;
  isRetrying: boolean;
};

export function OfflineScreen({ onRetry, isRetrying }: OfflineScreenProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-6 text-center select-none font-sans">
      {/* Light Theme Background Mesh & Soft Ambient Glowing Light Orbs */}
      <MeshBackground />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-brand-blue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 h-80 w-80 rounded-full bg-brand-cyan/10 blur-[100px] pointer-events-none" />

      {/* Main Light Glassmorphic Card */}
      <section className="relative z-10 w-full max-w-lg rounded-[32px] border border-slate-200/80 bg-white/90 p-8 md:p-12 backdrop-blur-2xl shadow-2xl shadow-slate-300/40 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Official Brand Logo & Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/assets/app-icon/app-icon.svg"
              alt="Faith Laundry Shop Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black uppercase tracking-tight text-slate-900 leading-none">
              Faith Laundry Shop
            </span>
            <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-brand-blue mt-1 leading-none">
              Management System
            </span>
          </div>
        </div>

        {/* Soft Warning Badge */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-rose-500/10 blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm">
            <WifiOff className="h-10 w-10" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight">
            {UI_LABELS.remoteAccess.OFFLINE_TITLE}
          </h1>
          <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-sm mx-auto">
            {UI_LABELS.remoteAccess.OFFLINE_DESCRIPTION}
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2 space-y-4">
          <Button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            variant="primary"
            size="lg"
            className="w-full h-14 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-black uppercase text-caption tracking-wider shadow-lg shadow-brand-blue/25 active:scale-98 transition-all gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>
              {isRetrying ? UI_LABELS.remoteAccess.RECONNECTING : UI_LABELS.remoteAccess.RETRY}
            </span>
          </Button>

          {/* Dynamic Status Indicator (Nielsen H1 & H2) */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600 transition-all">
            <span className="relative flex h-2 w-2">
              {isRetrying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isRetrying ? "bg-amber-500" : "bg-rose-500"
                }`}
              />
            </span>
            <span>
              {isRetrying
                ? "Attempting to reach shop server…"
                : "Disconnected — Tap Try Again to reconnect"}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
