"use client";

import React from "react";
import Link from "next/link";
import { User, Calendar, Hash, Banknote, Wallet, CreditCard, ShieldCheck, Eye } from "lucide-react";
import { type PaymentResponse } from "@/lib/api/payments";
import { DataTable, EmptyState } from "@/features/shared";
import { DataTableColumn } from "@/types/components";
import { UI_LABELS } from "@/constants/ui";
import { formatDate } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { Button } from "@/components/ui";

interface ExtendedPaymentLedgerTableProps {
  payments: PaymentResponse[];
  loading: boolean;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (payment: PaymentResponse) => void;
}

/**
 * Payment Ledger Table — High Fidelity (v5.0)
 * Standardized with sortable headers for financial transparency.
 * v4.0 Consistency Pass: Premium iconography, refined typography, and native DataTable container.
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
        <div className="flex items-center gap-3 group/ref">
          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover/ref:bg-brand-blue/5 transition-all">
            <Hash className="h-3.5 w-3.5 text-slate-400 group-hover/ref:text-brand-blue" />
          </div>
          <Link 
            href={`/orders/${p.orderId}`} 
            onClick={(e) => e.stopPropagation()} 
            className="text-body-sm font-black text-slate-900 font-mono tracking-tighter hover:text-brand-blue transition-colors"
          >
            {p.orderReferenceNumber ?? `#${p.orderId}`}
          </Link>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.CUSTOMER,
      sortable: true,
      sortKey: "order.customer.lastName",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-inner">
            <User className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="text-body-sm text-slate-700 font-bold">{p.customerName ?? "Anonymous"}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      sortable: true,
      sortKey: "paymentDate",
      render: (p) => (
        <div className="flex items-center gap-3 text-body-sm font-medium text-slate-500">
          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="font-bold">{formatDate(p.paymentDate)}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.METHOD,
      sortable: true,
      sortKey: "paymentMethod",
      render: (p) => {
        const isCash = p.paymentMethod === "CASH";
        const isGCash = p.paymentMethod === "GCASH";
        
        return (
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shadow-sm ${
              isCash ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
              isGCash ? 'bg-blue-50 border-blue-100 text-blue-600' : 
              'bg-purple-50 border-purple-100 text-purple-600'
            }`}>
              {isCash ? <Banknote className="h-4 w-4" /> : isGCash ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{p.paymentMethod}</span>
          </div>
        );
      },
    },
    {
      header: UI_LABELS.shared.common.TOTAL,
      sortable: true,
      sortKey: "amountPaid",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end">
          <CurrencyDisplay amount={p.amountPaid} size="sm" numberClassName="font-black text-slate-900" />
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.ACTIONS,
      align: "right",
      render: (p) => (
        <Link href={`/orders/${p.orderId}`} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="xs"
            className="w-9 p-0 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
            title={UI_LABELS.shared.common.DETAILS}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
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
