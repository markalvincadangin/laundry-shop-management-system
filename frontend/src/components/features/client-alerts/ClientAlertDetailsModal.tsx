"use client";

import React from "react";
import { 
  MessageSquare, 
  Calendar, 
  BadgeCheck, 
  AlertCircle, 
  Eye, 
  Smartphone,
  Hash,
  Clock,
  ArrowUpRight
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
 * Client Alert Details Modal (v2.0)
 * Reimagined as a 'Message Inspection' view for administrative transparency.
 * Removes 'dismiss' pattern in favor of clean information disclosure.
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
      className="rounded-[32px] overflow-hidden"
    >
      <div className="p-6 md:p-8 space-y-8 max-w-full overflow-x-hidden">
        {/* ── Summary Header ── */}
        <div className="flex items-start gap-5 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm">
          <div className={`mt-1 h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${
            isSent ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Overview</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-lg font-bold text-slate-900 leading-tight truncate">
                {isSent ? "Message Delivered" : "Delivery Failure"}
              </h4>
              <StatusBadge 
                variant={isSent ? "success" : "error"} 
                label={isSent ? "Verified" : "Action Required"} 
                icon={isSent ? BadgeCheck : AlertCircle}
                className="scale-90 origin-right"
              />
            </div>
          </div>
        </div>

        {/* ── Message Content ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            <Smartphone className="h-3.5 w-3.5" />
            Outgoing SMS Content
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-inner shadow-slate-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-slate-50/50 rounded-bl-3xl border-l border-b border-slate-100 flex items-center justify-center text-slate-200 group-hover:text-brand-blue/10 transition-colors">
               <MessageSquare className="h-8 w-8" />
            </div>
            <p className="text-body-sm font-medium text-slate-700 leading-relaxed italic relative z-10">
              "{notification.message}"
            </p>
          </div>
        </div>

        {/* ── Meta Grid ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1.5">
              <Hash className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                Order Context
              </span>
            </div>
            <p className="text-body-sm font-black text-slate-700 font-mono tracking-tight">
              {notification.referenceNumber || "System Event"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1.5">
              <Clock className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                Dispatch Time
              </span>
            </div>
            <p className="text-body-sm font-black text-slate-700 tabular-nums">
              {formatDateTime(notification.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Action Footer ── */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
          {notification.orderId && (
            <Link href={`/orders/${notification.orderId}`} className="w-full">
              <Button 
                variant="primary" 
                className="w-full h-12 gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-blue/20 rounded-2xl"
              >
                <Eye className="h-4 w-4" />
                Inspect Linked Order
                <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full sm:w-auto h-12 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl"
          >
            Close Details
          </Button>
        </div>
      </div>
    </Modal>
  );
}
