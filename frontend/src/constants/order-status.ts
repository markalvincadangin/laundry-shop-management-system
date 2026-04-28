import { UI_LABELS } from "./ui";
import { BRAND_COLORS } from "./brand-colors";
import {
  CheckCircle2,
  Inbox,
  WashingMachine,
  Sun,
  Package,
  Check,
  XCircle
} from "lucide-react";

export const ORDER_STATUS = {
  RECEIVED: "RECEIVED",
  WASHING: "WASHING",
  DRYING: "DRYING",
  FOLDING: "FOLDING",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  RELEASED: "RELEASED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

export const PAYMENT_METHODS = {
  CASH: "CASH",
  GCASH: "GCASH",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export interface StatusMetadata {
  label: string;
  bgClass: string;
  textClass: string;
  icon: any;
  color: string;
}

/**
 * ORDER_STATUS_META: Authoritative UI configuration for all laundry stages.
 * Mandated by FRONT-001 §10 (Constants-Driven UI Rule).
 * Uses BRAND_COLORS for deterministic styling.
 */
export const ORDER_STATUS_META: Record<OrderStatus, StatusMetadata> = {
  [ORDER_STATUS.RECEIVED]: {
    label: UI_LABELS.shared.status.RECEIVED,
    bgClass: "bg-slate-100 border-slate-200",
    textClass: "text-slate-600",
    icon: Inbox,
    color: BRAND_COLORS.slate[500],
  },
  [ORDER_STATUS.WASHING]: {
    label: UI_LABELS.shared.status.WASHING,
    bgClass: "bg-sky-50 border-sky-200",
    textClass: "text-brand-cyan-dark",
    icon: WashingMachine,
    color: BRAND_COLORS.cyanDark,
  },
  [ORDER_STATUS.DRYING]: {
    label: UI_LABELS.shared.status.DRYING,
    bgClass: "bg-amber-50 border-amber-200",
    textClass: "text-amber-700",
    icon: Sun,
    color: BRAND_COLORS.warning,
  },
  [ORDER_STATUS.FOLDING]: {
    label: UI_LABELS.shared.status.FOLDING,
    bgClass: "bg-blue-50 border-blue-100",
    textClass: "text-blue-700",
    icon: Package,
    color: "#1d4ed8",
  },
  [ORDER_STATUS.READY_FOR_PICKUP]: {
    label: UI_LABELS.shared.status.READY_FOR_PICKUP,
    bgClass: "bg-emerald-100 border-emerald-200",
    textClass: "text-emerald-700",
    icon: CheckCircle2,
    color: BRAND_COLORS.success,
  },
  [ORDER_STATUS.RELEASED]: {
    label: UI_LABELS.shared.status.RELEASED,
    bgClass: "bg-emerald-50 border-emerald-100",
    textClass: "text-slate-500",
    icon: CheckCircle2,
    color: BRAND_COLORS.slate[500],
  },
  [ORDER_STATUS.CANCELLED]: {
    label: UI_LABELS.shared.status.CANCELLED,
    bgClass: "bg-rose-50 border-rose-100",
    textClass: "text-rose-700",
    icon: XCircle,
    color: BRAND_COLORS.error,
  },
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.WASHING,
  ORDER_STATUS.DRYING,
  ORDER_STATUS.FOLDING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.RELEASED,
];

export const STATUS_TRANSITIONS: Record<OrderStatus, { label: string; next: OrderStatus; confirm: string } | null> = {
  [ORDER_STATUS.RECEIVED]:         { label: UI_LABELS.modules.orders.ONE_TAP_WASH,  next: ORDER_STATUS.WASHING,          confirm: UI_LABELS.modals.confirm.WASHING },
  [ORDER_STATUS.WASHING]:          { label: UI_LABELS.modules.orders.ONE_TAP_DRY,   next: ORDER_STATUS.DRYING,           confirm: UI_LABELS.modals.confirm.DRYING },
  [ORDER_STATUS.DRYING]:           { label: UI_LABELS.modules.orders.ONE_TAP_FOLD,  next: ORDER_STATUS.FOLDING,          confirm: UI_LABELS.modals.confirm.FOLDING },
  [ORDER_STATUS.FOLDING]:          { label: UI_LABELS.modules.orders.ONE_TAP_READY, next: ORDER_STATUS.READY_FOR_PICKUP, confirm: UI_LABELS.modals.confirm.READY },
  [ORDER_STATUS.READY_FOR_PICKUP]: { label: UI_LABELS.modules.orders.ONE_TAP_PICKUP, next: ORDER_STATUS.RELEASED,         confirm: UI_LABELS.modals.confirm.RELEASE },
  [ORDER_STATUS.RELEASED]:   null,
  [ORDER_STATUS.CANCELLED]:  null,
};
