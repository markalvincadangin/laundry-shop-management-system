"use client";

import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

const PAYMENT_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string; icon: any }
> = {
  PAID: {
    label: UI_LABELS.shared.status.PAID,
    bgClass: "bg-brand-blue/5 border-brand-blue/10 shadow-sm",
    textClass: "text-brand-blue",
    icon: CheckCircle2,
  },
  UNPAID: {
    label: UI_LABELS.shared.status.UNPAID,
    bgClass: "bg-amber-100 border-amber-200 shadow-sm",
    textClass: "text-amber-700",
    icon: AlertCircle,
  },
};

export function PaymentStatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const config = PAYMENT_CONFIG[status] ?? {
    label: status?.replace(/_/g, " ") ?? "—",
    bgClass: "bg-slate-50 border-slate-200",
    textClass: "text-slate-500",
    icon: Circle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${config.bgClass} ${config.textClass} ${className}`}
      role="status"
      aria-label={`Payment: ${config.label}`}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {config.label}
    </span>
  );
}
