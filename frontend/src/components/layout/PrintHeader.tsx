/* eslint-disable react/jsx-no-literals */
"use client";

import React from "react";
import Image from "next/image";
import { UI_LABELS } from "@/constants/ui";

interface PrintHeaderProps {
  module: string;
  period?: string;
}

/**
 * PrintHeader Component
 * Standardized header for printable reports and registries.
 * Only visible during print. Aligned with FRONT-001 §8.
 */
export function PrintHeader({ module, period }: PrintHeaderProps) {
  return (
    <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
      <div className="flex items-center gap-3 mb-4">
        <Image src="/assets/app-icon/app-icon.svg" alt="Logo" width={32} height={32} className="h-8 w-8" />
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{UI_LABELS.dynamic.FAITH_LAUNDRY_SHOP_2a14}</h1>
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{module}</p>
      <div className="mt-4 flex justify-between items-end">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Generated: {new Date().toLocaleString()}
        </p>
        {period && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
            {period}
          </p>
        )}
      </div>
    </div>
  );
}
