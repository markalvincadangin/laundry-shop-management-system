"use client";

import React, { useState } from "react";
import { Modal, Button, Input, Select } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { paymentsService } from "@/services/payments.service";
import { PaymentMethod } from "@/constants/order-status";
import { toast } from "sonner";
import { CreditCard, Wallet, Landmark, Banknote, Check } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

interface PaymentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  grandTotal: number;
  referenceNumber: string;
  onSuccess?: () => void;
}

export function PaymentActionModal({
  isOpen,
  onClose,
  orderId,
  grandTotal,
  referenceNumber,
  onSuccess,
}: PaymentActionModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [refNum, setRefNum] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      await paymentsService.create({
        orderId,
        amountPaid: grandTotal,
        paymentMethod: method,
        receivedByUserId: user.userId,
      });

      toast.success(UI_LABELS.feedback.success.PAYMENT);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: "CASH", label: "Cash", icon: Banknote },
    { value: "GCASH", label: "GCash", icon: Wallet },
    { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Landmark },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={UI_LABELS.modules.payments.RECORD_PAYMENT} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-5 text-center space-y-1">
          <p className="text-body-sm font-black uppercase tracking-[0.2em] text-brand-blue/60">
            {UI_LABELS.shared.common.AMOUNT_DUE || "Amount Due"} <span className="font-mono text-brand-blue">{referenceNumber}</span>
          </p>
          <div className="text-4xl font-display font-black text-slate-900 tracking-tighter">
            {UI_LABELS.shared.units.CURRENCY}{grandTotal.toFixed(2)}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">
              {UI_LABELS.shared.common.METHOD}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value as PaymentMethod)}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-white/20 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <Icon className="h-6 w-6" strokeWidth={isSelected ? 3 : 2} />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {method !== "CASH" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Input
                label={UI_LABELS.shared.common.REFERENCE}
                placeholder="e.g. 1029384756"
                value={refNum}
                onChange={(e) => setRefNum(e.target.value)}
                required
                className="bg-white"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 font-black uppercase tracking-widest text-caption"
          >
            {UI_LABELS.shared.buttons.CANCEL}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-[2] font-black uppercase tracking-widest text-caption bg-brand-blue shadow-xl shadow-brand-blue/20"
          >
            {UI_LABELS.shared.buttons.CONFIRM}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
