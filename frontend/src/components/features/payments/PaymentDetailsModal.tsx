import React from "react";
import { CreditCard, Calendar, User, ArrowRight, Receipt, ShieldCheck } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { PaymentResponse } from "@/lib/api/payments";
import { formatDate } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { UI_LABELS } from "@/constants/ui";
import Link from "next/link";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentResponse | null;
}

/**
 * Payment Details Modal
 * Design aligned with Faith Laundry forensic audit aesthetic.
 */
export function PaymentDetailsModal({ isOpen, onClose, payment }: PaymentDetailsModalProps) {
  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={UI_LABELS.modules.payments.VERIFICATION}
      size="md"
    >
      <div className="p-grid-6 space-y-grid-6">
        {/* Header Section */}
        <div className="flex items-center gap-grid-4 p-grid-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">{UI_LABELS.modules.payments.VERIFIED_TRANSACTION}</p>
            <div className="flex items-center justify-between gap-grid-2">
              <h4 className="text-h3 font-black text-slate-900 leading-tight">
                {payment.orderReferenceNumber || `#${payment.orderId}`}
              </h4>
              <CurrencyDisplay amount={payment.amountPaid} size="md" className="text-brand-blue" numberClassName="font-black" />
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="space-y-grid-4">
          <div className="grid grid-cols-2 gap-grid-4">
            <div className="p-grid-4 rounded-xl border border-slate-100 bg-white">
              <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
                <User className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{UI_LABELS.shared.common.CUSTOMER}</span>
              </div>
              <p className="text-body-sm font-black text-slate-700 truncate">
                {payment.customerName || "Anonymous"}
              </p>
            </div>
            <div className="p-grid-4 rounded-xl border border-slate-100 bg-white">
              <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{UI_LABELS.shared.common.DATE}</span>
              </div>
              <p className="text-body-sm font-black text-slate-700">
                {formatDate(payment.paymentDate)}
              </p>
            </div>
          </div>

          <div className="p-grid-4 rounded-xl border border-slate-100 bg-white">
            <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{UI_LABELS.shared.common.METHOD}</span>
            </div>
            <p className="text-body-sm font-black text-slate-700 uppercase tracking-tighter">
              {payment.paymentMethod?.replace(/_/g, ' ')}
            </p>
          </div>

          <div className="p-grid-4 rounded-xl border border-slate-100 bg-white">
            <div className="flex items-center gap-grid-2 text-slate-400 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success-700" />
              <span className="text-[10px] font-black uppercase tracking-widest">{UI_LABELS.modules.payments.RECEIVED_BY}</span>
            </div>
            <p className="text-body-sm font-black text-slate-700">
              {payment.receivedByUsername || "System Agent"}
            </p>
          </div>

          {payment.remarks && (
            <div className="p-grid-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{UI_LABELS.modules.payments.REMARKS}</div>
              <p className="text-body-sm font-medium text-slate-600 italic">
                &quot;{payment.remarks}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-grid-4 flex gap-grid-3">
          <Link href={`/orders/${payment.orderId}`} className="flex-1">
            <Button 
              variant="primary" 
              className="w-full h-12 gap-grid-2 font-black uppercase text-caption tracking-widest shadow-lg shadow-brand-blue/20"
            >
              {UI_LABELS.modules.clientAlerts.VIEW_ORDER}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-12 font-black uppercase text-caption tracking-widest border-slate-200"
          >
            {UI_LABELS.shared.buttons.DONE}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
