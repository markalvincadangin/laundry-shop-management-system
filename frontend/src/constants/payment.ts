import { UI_LABELS } from "./ui";
import {
  Wallet,
  Banknote,
  Building2,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

/**
 * PAYMENT_METHODS: Accepted payment channels.
 */
export const PAYMENT_METHOD = {
  CASH: "CASH",
  GCASH: "GCASH",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD;

export const PAYMENT_METHOD_META: Record<PaymentMethod, { label: string, icon: any }> = {
  [PAYMENT_METHOD.CASH]: {
    label: UI_LABELS.modules.payments.METHOD_CASH,
    icon: Banknote,
  },
  [PAYMENT_METHOD.GCASH]: {
    label: UI_LABELS.modules.payments.METHOD_GCASH,
    icon: Wallet,
  },
  [PAYMENT_METHOD.BANK_TRANSFER]: {
    label: UI_LABELS.modules.payments.METHOD_BANK,
    icon: Building2,
  },
};

/**
 * PAYMENT_STATUS: Payment lifecycle states.
 */
export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  VOIDED: "VOIDED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS;

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string, icon: any, colorClass: string }> = {
  [PAYMENT_STATUS.UNPAID]: {
    label: UI_LABELS.shared.status.UNPAID,
    icon: Clock,
    colorClass: "text-amber-700",
  },
  [PAYMENT_STATUS.PAID]: {
    label: UI_LABELS.shared.status.PAID,
    icon: CheckCircle2,
    colorClass: "text-emerald-700",
  },
  [PAYMENT_STATUS.PARTIAL]: {
    label: UI_LABELS.shared.status.PARTIAL,
    icon: CreditCard,
    colorClass: "text-brand-blue",
  },
  [PAYMENT_STATUS.VOIDED]: {
    label: UI_LABELS.shared.status.VOIDED,
    icon: AlertCircle,
    colorClass: "text-rose-400",
  },
  [PAYMENT_STATUS.REFUNDED]: {
    label: UI_LABELS.shared.status.REFUNDED,
    icon: AlertCircle,
    colorClass: "text-slate-400",
  },
};
