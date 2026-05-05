"use client";

import React from "react";
import {
  Receipt,
  User,
  Scale,
  Clock,
  PlusCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import { OrderPreviewResponse } from "@/services/orders.service";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_TYPES, ServiceType } from "@/constants/service-types";
import { motion, AnimatePresence } from "framer-motion";

interface LiveTicketProps {
  customerName?: string;
  serviceType: string;
  weightKg: number;
  extraMinutes: number;
  notes?: string;
  preview: OrderPreviewResponse | null;
  loading?: boolean;
}

/**
 * LiveTicket: A premium, reactive "Live Preview" of the order.
 * Provides immediate visual feedback to the staff and customer.
 */
export function LiveTicket({
  customerName,
  serviceType,
  weightKg,
  extraMinutes,
  notes,
  preview,
  loading
}: LiveTicketProps) {
  const service = SERVICE_TYPES[serviceType as ServiceType] || SERVICE_TYPES.WASH_DRY_FOLD;
  const ServiceIcon = service.icon;

  return (
    <div className="sticky top-8 space-y-6">
      <div className="relative group">
        {/* Paper Effect */}
        <div className="absolute inset-0 bg-slate-900/5 translate-x-1 translate-y-1 rounded-2xl" />

        <div className="relative bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest leading-none">Live Preview</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Faith Laundry Shop</p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Customer Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Details</span>
              </div>
              <p className="text-lg font-black text-slate-900 truncate pl-7">
                {customerName || "Walk-in Customer"}
              </p>
            </div>

            {/* Service & Weight */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ServiceIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service</span>
                </div>
                <p className="text-sm font-bold text-slate-900 pl-7">{service.label}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight</span>
                </div>
                <p className="text-sm font-bold text-slate-900 pl-7">
                  {weightKg > 0 ? `${weightKg} kg` : "—"}
                </p>
              </div>
            </div>

            {/* Notes Section (§1.4) */}
            {notes && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Special Instructions</span>
                </div>
                <p className="text-sm font-bold text-slate-900 italic pl-7 leading-relaxed">
                  &quot;{notes}&quot;
                </p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bill Breakdown</span>
                </div>
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] font-black text-brand-blue animate-pulse uppercase"
                    >
                      Calculating...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-3 pl-7">
                {preview ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Base Price ({preview.totalLoads} {preview.totalLoads === 1 ? 'load' : 'loads'})</span>
                      <span className="font-bold text-slate-900">{formatCurrency(preview.baseAmount)}</span>
                    </div>
                    {preview.extraMinutesAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Extra Minutes ({extraMinutes}m)</span>
                        <span className="font-bold text-slate-900">{formatCurrency(preview.extraMinutesAmount)}</span>
                      </div>
                    )}
                    {preview.addonsTotalAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Add-ons Total</span>
                        <span className="font-bold text-slate-900">{formatCurrency(preview.addonsTotalAmount)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Enter weight to see breakdown</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="pt-6 border-t-2 border-dashed border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Grand Total</span>
              </div>
              <motion.h2
                key={preview?.grandTotal}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-4xl font-display font-black text-slate-900 tracking-tighter"
              >
                {preview ? formatCurrency(preview.grandTotal) : "₱0.00"}
              </motion.h2>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="h-4 bg-slate-900 flex items-center justify-around">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-white/20" />
            ))}
          </div>
        </div>

        {/* Floating Tooltip if weight missing */}
        {!preview && weightKg > 0 && !loading && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
            <AlertCircle className="h-3 w-3" />
            Invalid Calculation
          </div>
        )}
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <Clock className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="text-[10px] font-bold text-slate-500 leading-tight">
          Live pricing is based on current store rates and weight validation.
        </p>
      </div>
    </div>
  );
}
