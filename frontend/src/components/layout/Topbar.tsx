"use client";

import { useState, useEffect } from "react";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Calendar } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ClientAlertPopover } from "@/features/client-alerts";
import { TopbarProps } from "@/types/components";

/**
 * Topbar — Persistent top navigation bar (v3.0).
 * FRONT-001 §11.1. F-pattern: Title left — Controls right.
 */
export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats } = useOrders({ size: 1 });

  // Listen for ?new=true to navigate to the new order page (§10)
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      router.push("/orders/new");
    }
  }, [searchParams, router]);

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header
      className="sticky top-0 z-[200] hidden lg:flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-5 xl:px-8 gap-4 shadow-sm shadow-slate-200/40"
      role="banner"
    >
      {/* Left zone — Page title */}
      <h2 className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-700 truncate">
        {title}
      </h2>

      {/* Right zone — Controls */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Date chip — hidden at xl to save space, shown at 2xl */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-inner">
          <Calendar className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <span 
            suppressHydrationWarning
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap"
          >
            {today}
          </span>
        </div>
        {/* Notification Hub */}
        <ClientAlertPopover />

        {/* ── Primary CTA — New Order ── */}
        <div id="topbar-new-order-cta">
          {/* Icon-only at lg (1024–1279px) */}
          <button
            onClick={() => router.push("/orders/new")}
            className="xl:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-md shadow-brand-blue/25 hover:bg-brand-blue/90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:ring-offset-2"
            aria-label={UI_LABELS.layout.nav.INTAKE}
            title={UI_LABELS.layout.nav.INTAKE}
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Icon + text at xl+ */}
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            className="hidden xl:inline-flex whitespace-nowrap"
            onClick={() => router.push("/orders/new")}
          >
            {UI_LABELS.layout.nav.INTAKE}
          </Button>
        </div>
      </div>
    </header>
  );
}
