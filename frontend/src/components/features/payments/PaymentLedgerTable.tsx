"use client";

import React from "react";
import Link from "next/link";
import { User, Calendar, ArrowUpRight } from "lucide-react";
import { type PaymentResponse } from "@/services/payments.service";
import { DataTable, EmptyState } from "@/features/shared";
import { DataTableColumn } from "@/types/components";
import { UI_LABELS } from "@/constants/ui";
import { formatDate } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface ExtendedPaymentLedgerTableProps {
  payments: PaymentResponse[];
  loading: boolean;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (payment: PaymentResponse) => void;
}

/**
 * Payment Ledger Table
 * Standardized with sortable headers for financial transparency.
 */
export function PaymentLedgerTable({ 
  payments, 
  loading, 
  sortBy, 
  sortDir, 
  onSort, 
  onRowClick 
}: ExtendedPaymentLedgerTableProps) {
  const columns: DataTableColumn<PaymentResponse>[] = [
    {
      header: UI_LABELS.shared.common.REFERENCE,
      sortable: true,
      sortKey: "order.referenceNumber",
      render: (p) => (
        <Link href={`/orders/${p.orderId}`} onClick={(e) => e.stopPropagation()} className="text-sm font-bold text-slate-900 hover:text-brand-blue transition-colors font-mono">
          {p.orderReferenceNumber ?? `#${p.orderId}`}
        </Link>
      ),
    },
    {
      header: UI_LABELS.shared.common.CUSTOMER,
      sortable: true,
      sortKey: "order.customer.lastName",
      render: (p) => (
        <div className="flex items-center gap-2">
           <User className="h-3.5 w-3.5 text-slate-400" />
           <span className="text-sm text-slate-700 font-bold">{p.customerName ?? "Anonymous"}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      sortable: true,
      sortKey: "paymentDate",
      render: (p) => (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {formatDate(p.paymentDate)}
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.METHOD,
      sortable: true,
      sortKey: "paymentMethod",
      render: (p) => {
        const method = p.paymentMethod;
        const labels = {
          CASH: { label: UI_LABELS.modules.payments.METHOD_CASH, class: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          GCASH: { label: UI_LABELS.modules.payments.METHOD_GCASH, class: "bg-sky-50 text-sky-700 border-sky-100" },
          BANK_TRANSFER: { label: UI_LABELS.modules.payments.METHOD_BANK, class: "bg-indigo-50 text-indigo-700 border-indigo-100" }
        };
        const config = labels[method as keyof typeof labels] || { label: method, class: "bg-slate-50 text-slate-700 border-slate-100" };
        
        return (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${config.class}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      header: UI_LABELS.shared.common.TOTAL,
      sortable: true,
      sortKey: "amountPaid",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5 group-hover:text-slate-900 transition-colors">
          <CurrencyDisplay amount={p.amountPaid} size="md" numberClassName="font-bold text-brand-blue" />
          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={payments}
      columns={columns}
      loading={loading}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
      onRowClick={onRowClick}
      emptyState={
        <EmptyState
          title={UI_LABELS.feedback.empty.PAYMENTS_TITLE}
          description={UI_LABELS.feedback.empty.PAYMENTS_DESC}
        />
      }
    />
  );
}
