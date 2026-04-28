import React from "react";
import { Bell, Calendar, BadgeCheck, AlertCircle, Eye, ExternalLink } from "lucide-react";
import { Modal, Button, StatusBadge } from "@/components/ui";
import { ClientAlertResponse } from "@/services/client-alerts.service";
import { formatDate } from "@/lib/utils";
import { UI_LABELS } from "@/constants/ui";
import Link from "next/link";

interface ClientAlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: ClientAlertResponse | null;
}

/**
 * Client Alert Details Modal
 * Consistent with Faith Laundry forensic audit aesthetic.
 */
export function ClientAlertDetailsModal({ isOpen, onClose, notification }: ClientAlertDetailsModalProps) {
  if (!notification) return null;

  const isSent = notification.status === "SENT";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={UI_LABELS.modules.clientAlerts.DETAILS_TITLE}
      size="md"
    >
      <div className="p-grid-6 space-y-grid-6">
        {/* Header Section */}
        <div className="flex items-center gap-grid-4 p-grid-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
            isSent ? 'bg-brand-cyan/10 text-brand-cyan-dark' : 'bg-error-50 text-error-700'
          }`}>
            <Bell className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
              {UI_LABELS.modules.clientAlerts.SYSTEM_ALERT}
            </p>
            <div className="flex items-center justify-between gap-grid-2">
              <h4 className="text-h3 font-black text-slate-900 leading-tight">
                {notification.referenceNumber || UI_LABELS.modules.clientAlerts.SYSTEM_EVENT}
              </h4>
              <StatusBadge 
                variant={isSent ? "success" : "error"} 
                label={isSent ? UI_LABELS.modules.clientAlerts.STATUS_VERIFIED : UI_LABELS.modules.clientAlerts.STATUS_ACTION_REQUIRED} 
                icon={isSent ? BadgeCheck : AlertCircle}
              />
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-grid-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-grid-1">
            {UI_LABELS.modules.clientAlerts.MESSAGE}
          </label>
          <div className="p-grid-5 rounded-2xl border border-slate-200 bg-white shadow-inner-sm min-h-[120px]">
            <p className="text-body font-medium text-slate-700 leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-grid-4">
          <div className="p-grid-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {UI_LABELS.modules.clientAlerts.LOGGED_AT}
              </span>
            </div>
            <p className="text-body-sm font-black text-slate-700">
              {formatDate(notification.createdAt)}
            </p>
          </div>
          <div className="p-grid-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {UI_LABELS.modules.clientAlerts.CHANNEL}
              </span>
            </div>
            <p className="text-body-sm font-black text-slate-700 uppercase tracking-tighter">
              {UI_LABELS.modules.clientAlerts.CHANNEL_INTERNAL}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-grid-4 flex gap-grid-3">
          {notification.orderId && (
            <Link href={`/orders/${notification.orderId}`} className="flex-1">
              <Button 
                variant="primary" 
                className="w-full h-12 gap-grid-2 font-black uppercase text-caption tracking-widest shadow-lg shadow-brand-blue/20"
              >
                <Eye className="h-4 w-4" />
                {UI_LABELS.modules.clientAlerts.VIEW_ORDER}
              </Button>
            </Link>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-12 font-black uppercase text-caption tracking-widest border-slate-200"
          >
            {UI_LABELS.modules.clientAlerts.DISMISS}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
