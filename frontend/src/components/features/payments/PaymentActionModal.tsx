"use client";

import React, { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { useAuth } from "@/stores/auth-store";
import { usePaymentAction } from "@/hooks/usePaymentAction";
import { type PaymentMethod } from "@/constants/payment";
import { Wallet, Banknote, Check, Landmark } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  grandTotal: number;
  trackingNumber: string;
  onSuccess?: () => void;
}

/**
 * PaymentActionModal
 * Inline settlement overlay for the Dashboard Pipeline and Order List.
 * Hardened v3.0: Uses usePaymentAction hook for consistent logic and cache invalidation.
 */
export function PaymentActionModal({
  isOpen,
  onClose,
  orderId,
  grandTotal,
  trackingNumber,
  onSuccess,
}: PaymentActionModalProps) {
  const { user } = useAuth();
  const { settlePayment, isSubmitting } = usePaymentAction();

  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [refNum, setRefNum] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await settlePayment({
        orderId,
        amountPaid: grandTotal,
        paymentMethod: method,
        receivedByUserId: user.userId,
      });

      onSuccess?.();
      onClose();
      // Reset local state
      setRefNum("");
      setMethod("CASH");
    } catch (error) {
      // Error handled by hook toasts
    }
  };

  const paymentMethods = [
    { value: "CASH", label: UI_LABELS.modules.payments.METHOD_CASH || "Cash", icon: Banknote },
    { value: "GCASH", label: UI_LABELS.modules.payments.METHOD_GCASH || "GCash", icon: Wallet },
    { value: "BANK_TRANSFER", label: UI_LABELS.modules.payments.METHOD_BANK || "Bank Transfer", icon: Landmark },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={UI_LABELS.modules.payments.RECORD_PAYMENT} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-5 text-center space-y-1"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue/60">
            {UI_LABELS.shared.common.AMOUNT_DUE || "Amount Due"} <span className="font-mono text-brand-blue">{trackingNumber}</span>
          </p>
          <div className="text-4xl font-display font-black text-slate-900 tracking-tighter">
            {UI_LABELS.units.PRICE_SYMBOL || "₱"}{grandTotal.toFixed(2)}
          </div>
        </motion.div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
              {UI_LABELS.shared.common.METHOD}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((m, idx) => {
                const Icon = m.icon;
                const isSelected = method === m.value;
                return (
                  <motion.button
                    key={m.value}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setMethod(m.value as PaymentMethod)}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                        ? "border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="active-check"
                        className="absolute top-2 right-2 bg-white/20 rounded-full p-1"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                    <Icon className="h-6 w-6" strokeWidth={isSelected ? 3 : 2} />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {m.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {method !== "CASH" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <Input
                    label={UI_LABELS.shared.common.TRACKING_NUMBER}
                    placeholder="e.g. 1029384756"
                    value={refNum}
                    onChange={(e) => setRefNum(e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 font-black uppercase tracking-widest text-caption h-12"
          >
            {UI_LABELS.shared.buttons.CANCEL}
          </Button>
          <Button
            type="submit"
            requiresOnline
            className="flex-[2] font-black uppercase tracking-widest text-caption bg-brand-blue shadow-xl shadow-brand-blue/20 h-12 rounded-xl"
            isLoading={isSubmitting}
            disabled={isSubmitting || !user}
          >
            {UI_LABELS.shared.buttons.CONFIRM}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
