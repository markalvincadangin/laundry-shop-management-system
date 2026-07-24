/* eslint-disable react/jsx-no-literals */
"use client";

import React from "react";
import {
  Receipt,
  User,
  Scale,
  PlusCircle,
  FileText,
  Calendar,
  Clock,
  Zap
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { SERVICE_TYPES, ServiceType } from "@/constants/service-types";
import { motion, AnimatePresence } from "framer-motion";
import { UI_LABELS } from "@/constants/ui";
import type { OrderPreviewProps } from "@/types/components";

/**
 * OrderPreview: A high-fidelity, real-time ticket preview for the Intake Wizard.
 * Institutionalized by FRONT-001 §6.1 and FRONT-002 §6.1 (LiveTicket™ Pattern).
 * 
 * HCI Principles Applied:
 * - Doherty Threshold: Instant visual response to data entry via Motion transitions.
 * - Von Restorff Effect: Isolation of the Grand Total as the high-contrast focal point.
 * - Gestalt Proximity: Clear grouping of logistics (Service/Weight) vs financial data.
 */
export function OrderPreview({
  customerName,
  serviceType,
  weightKg,
  extraMinutes,
  notes,
  addOns = [],
  preview,
  loading
}: OrderPreviewProps) {
  const service = SERVICE_TYPES[serviceType as ServiceType] || SERVICE_TYPES.WASH_DRY_FOLD;
  const ServiceIcon = service.icon;

  return (
    <div className="sticky top-8 space-y-6 select-none">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative group"
      >
        {/* Visual Depth / Ambient Blue Glow (§2.1) */}
        {/* Removed ambient blob to comply with spec */}

        {/* Physical Paper Stack Effect */}
        <div className="absolute inset-0 bg-slate-900/10 translate-x-3 translate-y-3 rounded-3xl -z-10 blur-sm" />
        <div className="absolute inset-0 bg-slate-200 translate-x-1.5 translate-y-1.5 rounded-3xl -z-10" />

        <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:-translate-y-2 ring-1 ring-slate-900/5">

          {/* Header Zone: Premium Slate Backdrop (§2.2) */}
          <div className="bg-slate-900 text-white px-8 py-8 flex items-center justify-between overflow-hidden relative">
            {/* Decorative Glass Circle */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />

            <div className="flex items-center gap-5 relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Receipt className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white/60 uppercase tracking-[0.2em] mb-1">
                  {UI_LABELS.modules.orders.ORDER_PREVIEW}
                </h3>
              </div>
            </div>

            {/* Decorative background removed for cleaner look */}
          </div>

          {/* Ticket Body Content */}
          <div className="p-8 space-y-6">

            {/* 1. Customer Context (§Miller's Law) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 opacity-50">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">
                  {UI_LABELS.shared.common.CUSTOMER}
                </span>
              </div>
              <motion.p
                key={customerName}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black text-slate-900 truncate pl-6 tracking-tight"
              >
                {customerName || UI_LABELS.modules.orders.CUSTOMER}
              </motion.p>
            </div>

            {/* 2. Logistics Grid (§Gestalt Proximity) */}
            <div className="grid grid-cols-2 gap-0 py-8 border-slate-100 bg-slate-50/50 -mx-8 px-8">
              <div className="space-y-4 border-r border-slate-100 pr-4">
                <div className="flex items-center gap-2 opacity-50">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">
                    {UI_LABELS.modules.orders.SERVICE_TYPE}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 pl-6 uppercase tracking-tight leading-none">
                  {service.label}
                </p>
              </div>

              <div className="space-y-4 pl-8">
                <div className="flex items-center gap-2 opacity-50">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">
                    {UI_LABELS.modules.orders.WEIGHT}
                  </span>
                </div>
                <motion.p
                  key={weightKg}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-mono font-black text-slate-900 pl-6 tabular-nums"
                >
                  {weightKg > 0
                    ? `${weightKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${UI_LABELS.shared.units.WEIGHT}`
                    : "—"
                  }
                </motion.p>
              </div>
            </div>

            {/* 3. Narrative Add-ons / Notes (§Progressive Disclosure) */}
            <AnimatePresence mode="wait">
              {(notes || addOns.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-6"
                >
                  {notes && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">
                          {UI_LABELS.modules.orders.SPECIAL_INSTRUCTIONS}
                        </span>
                      </div>
                      <div className="pl-6">
                        <p className="text-xs font-medium text-slate-500 leading-relaxed bg-brand-blue/5 p-4 rounded-2xl border border-brand-blue/10 break-words whitespace-pre-wrap">
                          {UI_LABELS.dynamic.STR_eb6439}{notes}{UI_LABELS.dynamic.STR_eb6439}
                        </p>
                      </div>
                    </div>
                  )}

                  {addOns.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">
                          {UI_LABELS.modules.orders.ADD_ONS}
                        </span>
                      </div>
                      <div className="pl-6 space-y-2">
                        {addOns.map((a, i) => (
                          <div key={i} className="flex justify-between items-center text-sm group/line cursor-default py-1">
                            <span className="text-slate-500 font-medium group-hover:text-slate-900 transition-colors flex items-center gap-2">
                              <PlusCircle className="h-3 w-3 text-brand-blue/40" />
                              {a.name}
                              <span className="te{UI_LABELS.dynamic.X_9dd4}t-[9p{UI_LABELS.dynamic.X_9dd4}] font-mono font-black uppercase te{UI_LABELS.dynamic.X_9dd4}t-brand-blue bg-brand-blue/5 p{UI_LABELS.dynamic.X_9dd4}-1.5 py-0.5 rounded">
                                x{a.quantity}
                              </span>
                            </span>
                            <CurrencyDisplay
                              amount={a.price * a.quantity}
                              size="md"
                              tabular={true}
                              numberClassName="font-mono font-black"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Financial Calculation Zone (§Peak-End Rule) */}
            <div className="space-y-4 pt-2">
              {/* Syncing Indicator (§Doherty Threshold) */}
              <div className="flex items-center justify-end h-6">
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 text-[9px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20"
                    >
                      <Spinner size="sm" />
                      {UI_LABELS.modules.orders.SYNCING}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4 pl-6">
                {preview ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm group/line cursor-default">
                      <span className="text-slate-500 font-medium group-hover:text-slate-900 transition-colors">
                        {UI_LABELS.modules.orders.SERVICE_FEE}
                        <span className="text-[10px] font-mono font-black uppercase text-slate-400 ml-2 bg-slate-100 px-1.5 py-0.5 rounded">
                          {preview.totalLoads} {preview.totalLoads === 1 ? UI_LABELS.shared.units.LOAD : UI_LABELS.shared.units.LOADS}
                        </span>
                      </span>
                      <CurrencyDisplay
                        amount={preview.baseAmount}
                        size="md"
                        numberClassName="font-mono font-black"
                      />
                    </div>

                    {preview.extraMinutesAmount > 0 && (
                      <div className="flex justify-between items-center text-sm group/line cursor-default">
                        <span className="text-slate-500 font-medium group-hover:text-slate-900 transition-colors">
                          {UI_LABELS.modules.orders.EXTRA_TIME_FEE}
                          <span className="text-[10px] font-mono font-black uppercase text-slate-400 ml-2 bg-slate-100 px-1.5 py-0.5 rounded">
                            {extraMinutes} {UI_LABELS.shared.units.TIME}
                          </span>
                        </span>
                        <CurrencyDisplay
                          amount={preview.extraMinutesAmount}
                          size="md"
                          numberClassName="font-mono font-black"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-6 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200"
                  >
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                      {UI_LABELS.modules.orders.AWAITING_DATA}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 5. The Grand Total (§Von Restorff Effect) */}
            <div className="pt-6 relative">
              <div className="absolute top-0 -left-11 h-6 w-6 bg-neutral-50 border-r border-slate-200 rounded-full" />
              <div className="absolute top-0 -right-11 h-6 w-6 bg-neutral-50 border-l border-slate-200 rounded-full" />

              <div className="flex items-center justify-between mb-4 mt-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                  {UI_LABELS.modules.orders.TOTAL}
                </span>
              </div>

              <motion.div
                key={preview?.grandTotal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-end justify-between"
              >
                <div className="flex items-baseline gap-2">
                  <CurrencyDisplay
                    amount={preview?.grandTotal ?? 0}
                    size="xl"
                    className="text-6xl md:text-7xl tracking-tighter leading-none"
                    numberClassName="font-black"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Machine-Clipped Serrated Footer (§2.8) */}
          <div className="h-8 bg-slate-900 flex items-center justify-around relative overflow-hidden">
            <div className="absolute inset-0 flex justify-between px-3">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="h-6 w-6 bg-white rounded-full -mt-3 shadow-inner" />
              ))}
            </div>
            {/* Authenticity Watermark */}
            <p className="text-[8px] font-black text-white/5 uppercase tracking-[1em] absolute bottom-2 w-full text-center">
              Faith Laundry Shop Official Receipt Preview
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
