"use client";

import React from "react";
import {
  FileText,
  Download,
  User,
  ArrowUpRight,
  Search,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck
} from "lucide-react";
import { type PaymentResponse } from "@/services/payments.service";
import { Card, Button, Input } from "@/components/ui";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { UI_LABELS } from "@/constants/ui";
import { usePayments } from "@/hooks/usePayments";
import { Pagination, DataTable } from "@/features/shared";
import { DataTableColumn, DetailedSalesTableProps } from "@/types/components";
import { useRegistry } from "@/hooks/useRegistry";
import { exportToCSV } from "@/lib/export-utils";

/**
 * Detailed Sales Table (Ledger)
 * Refactored to use Payment-centric model for forensic audit.
 * Adheres to FRONT-001 §4.2 and FRONT-002 §8.1.
 */
export function DetailedSalesTable({ date, from, to, label }: DetailedSalesTableProps) {
  const {
    params,
    sortBy,
    sortDir,
    searchTerm,
    setSearchTerm,
    updateParams,
    handleSort
  } = useRegistry({
    defaultSortBy: "paymentDate",
    defaultSortDir: "desc",
    defaultPageSize: 10
  });

  const { payments, loading, pagination } = usePayments({
    ...params,
    from: from || date,
    to: to || date,
    ...(searchTerm ? { searchTerm } : {})
  });

  const handleExport = () => {
    exportToCSV(
      payments.map(p => ({
        date: p.paymentDate,
        reference: p.orderReferenceNumber,
        customer: p.customerName,
        method: p.paymentMethod,
        amount: p.amountPaid,
        processor: p.receivedByUsername
      })),
      `Sales_Report_${date || 'Range'}`,
      {
        date: "Date",
        reference: "Reference",
        customer: "Customer",
        method: "Method",
        amount: "Amount",
        processor: "Processed By"
      }
    );
  };

  const columns: DataTableColumn<PaymentResponse>[] = [
    {
      header: UI_LABELS.shared.common.REFERENCE,
      sortable: true,
      sortKey: "orderReferenceNumber",
      render: (p) => (
        <span className="text-xs font-bold text-slate-900 font-mono tracking-widest bg-slate-100 px-2 py-1 rounded border border-slate-200 group-hover:bg-brand-blue/5 group-hover:border-brand-blue/20 group-hover:text-brand-blue transition-all">
          {p.orderReferenceNumber}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.CUSTOMER,
      sortable: true,
      sortKey: "customerName",
      render: (p) => (
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-sm text-slate-700 font-bold">{p.customerName || `Order #${p.orderId}`}</span>
        </div>
      ),
    },
    {
      header: "METHOD",
      sortable: true,
      sortKey: "paymentMethod",
      render: (p) => {
        const isCash = p.paymentMethod === "CASH";
        const isGCash = p.paymentMethod === "GCASH";
        return (
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isCash ? 'bg-emerald-50 text-emerald-600' : isGCash ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
              {isCash ? <Banknote className="h-3.5 w-3.5" /> : isGCash ? <Wallet className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{p.paymentMethod}</span>
              {p.paymentReference && (
                <span className="text-[9px] font-mono text-slate-400">Ref: {p.paymentReference}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "PROCESSED BY",
      sortable: true,
      sortKey: "receivedByUsername",
      render: (p) => (
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{p.receivedByUsername || 'SYSTEM'}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.TOTAL,
      sortable: true,
      sortKey: "amountPaid",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <CurrencyDisplay amount={p.amountPaid} size="sm" numberClassName="text-slate-900 font-bold" />
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand-blue transition-colors" />
        </div>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
            <FileText className="h-5 w-5 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-slate-900 font-extrabold tracking-tight">{UI_LABELS.modules.reports.SALES_HISTORY}</h3>
            <p className="text-xs text-slate-500 uppercase font-extrabold tracking-widest">
              {label || `Detailed breakdown for ${date}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-3.5 w-3.5" />}
            className="w-full md:w-64 h-10 text-xs"
          />
          <Button variant="outline" size="sm" className="h-10 px-6 gap-2 text-xs font-extrabold uppercase tracking-widest border-slate-200 shrink-0" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            {UI_LABELS.modules.reports.EXPORT_CSV}
          </Button>
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        loading={loading}
        density="compact"
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onRowClick={(p) => window.location.href = `/orders/${p.orderId}`}
      />

      {payments.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex items-center justify-between group/total">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover/total:text-slate-500 transition-colors">{UI_LABELS.shared.common.TOTAL}</span>
          <CurrencyDisplay
            amount={payments.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)}
            size="xl"
            className="text-slate-900 group-hover/total:text-brand-blue transition-colors duration-500"
          />
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalElements={pagination.totalElements}
        pageSize={params.size}
        onPageChange={(p) => updateParams({ page: p })}
        onPageSizeChange={(s) => updateParams({ size: s, page: 0 })}
        isLoading={loading}
      />
    </Card>
  );
}
