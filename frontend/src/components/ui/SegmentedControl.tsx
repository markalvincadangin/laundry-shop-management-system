"use client";

import React from "react";
import { SegmentedControlProps } from "@/types/components";

export function SegmentedControl({ options, value, onChange, className = "" }: SegmentedControlProps) {
  return (
    <div className={`inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 min-h-[44px] ${
            value === option.value 
              ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
              : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
