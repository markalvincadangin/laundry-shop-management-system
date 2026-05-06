"use client";

import React from "react";
import { 
  MessageSquare, 
  BadgeCheck, 
  AlertCircle, 
  Eye, 
  Smartphone,
  Hash,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { Modal, Button, StatusBadge } from "@/components/ui";
import { ClientAlertResponse } from "@/services/client-alerts.service";
import { formatDateTime } from "@/lib/utils";
import { UI_LABELS } from "@/constants/ui";
import Link from "next/link";

interface ClientAlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: ClientAlertResponse | null;
}

/**
 * Client Alert Details Modal (v3.0) — High Fidelity
 * Reimagined as a 'Message Inspection' view for administrative transparency.
 * Standardized with the Faith Laundry forensic design system.
 */
export function ClientAlertDetailsModal({ isOpen, onClose, notification }: ClientAlertDetailsModalProps) {
  if (!notification) return null;

  const isSent = notification.status === "SENT";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Communication Details"
      size="md"
      className="rounded-[32px]"
    >
      <div className="p-grid-6 md:p-grid-10 space-y-grid-10 max-w-full overflow-x-hidden">
        {/* ── Summary Header ── */}
        <div className="flex items-start gap-grid-6 p-grid-6 rounded-[24px] bg-slate-50/50 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 h-24 w-24 bg-brand-blue/5 blur-3xl rounded-full -mt-10 -mr-10 opacity-50" />
          
          <div className={`mt-1 h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 relative z-10 ${
            isSent ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
            <MessageSquare className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 min-w-0 flex-1 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Delivery Overview</p>
            <div className="flex flex-wrap items-center justify-between gap-grid-2">
              <h4 className="text-h3 font-black text-slate-900 leading-tight truncate">
                {isSent ? "Message Delivered" : "Delivery Failure"}
              </h4>
              <StatusBadge 
                variant={isSent ? "success" : "error"} 
                label={isSent ? "SENT" : "FAILED"} 
                icon={isSent ? BadgeCheck : AlertCircle}
                className="font-black tracking-[0.1em] text-[9px]"
              />
            </div>
          </div>
        </div>

        {/* ── Message Content ── */}
        <div className="space-y-grid-3">
          <div className="flex items-center gap-grid-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-grid-1">
            <Smartphone className="h-3.5 w-3.5 text-brand-blue" />
            Outgoing SMS Content
          </div>
          <div className="p-grid-6 rounded-[24px] border border-slate-200 bg-white shadow-inner-sm relative overflow-hidden group min-h-[140px]">
            <div className="absolute top-0 right-0 h-16 w-16 bg-slate-50/50 rounded-bl-3xl border-l border-b border-slate-100 flex items-center justify-center text-slate-100 group-hover:text-brand-blue/10 transition-colors">
               <MessageSquare className="h-8 w-8" />
            </div>
            <p className="text-body font-medium text-slate-700 leading-relaxed italic relative z-10 pr-grid-4">
              &quot;{notification.message}&quot;
            </p>
          </div>
        </div>

        {/* ── Meta Grid ── */}
        <div className="grid grid-cols-2 gap-grid-4">
          <div className="p-grid-5 rounded-[20px] bg-slate-50/50 border border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
              <Hash className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Order Context
              </span>
            </div>
            <p className="text-body-sm font-black text-slate-800 font-mono tracking-tight">
              {notification.referenceNumber || "SYSTEM_EVENT"}
            </p>
          </div>
          <div className="p-grid-5 rounded-[20px] bg-slate-50/50 border border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Dispatch Time
              </span>
            </div>
            <p className="text-body-sm font-black text-slate-800 tabular-nums">
              {formatDateTime(notification.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Action Footer ── */}
        <div className="flex flex-col gap-grid-6 pt-grid-4">
          <div className="flex flex-col sm:flex-row items-center gap-grid-4">
            {notification.orderId && (
              <Link href={`/orders/${notification.orderId}`} className="w-full">
                <Button 
                  variant="primary" 
                  className="w-full h-14 gap-grid-3 font-black uppercase text-caption tracking-[0.2em] shadow-xl shadow-brand-blue/20 rounded-2xl active:scale-95 transition-all"
                >
                  <Eye className="h-4 w-4" />
                  Inspect Linked Order
                  <ArrowUpRight className="h-4 w-4 opacity-50" />
                </Button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full sm:w-auto h-14 px-grid-10 font-black uppercase text-caption tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
            >
              Close Details
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
