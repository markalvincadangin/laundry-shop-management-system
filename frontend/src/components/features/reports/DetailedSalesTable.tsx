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
  ShieldCheck,
  Hash
} from "lucide-react";
import { type PaymentResponse } from "@/services/payments.service";
import { Button, Input, CurrencyDisplay } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { usePayments } from "@/hooks/usePayments";
import { Pagination, DataTable, FilterBar } from "@/features/shared";
import { DataTableColumn, DetailedSalesTableProps } from "@/types/components";
import { useRegistry } from "@/hooks/useRegistry";
import { exportToCSV } from "@/lib/export-utils";
import { motion } from "framer-motion";

/**
 * Detailed Sales Table (Ledger) — High Fidelity (v5.0)
 * Refactored to use Payment-centric model for forensic audit.
 * Adheres to FRONT-001 §4.2 and FRONT-002 §8.1.
 * v4.0 Consistency Pass: Premium header, standardized spacing, and native DataTable container.
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
        <div className="flex items-center gap-3 group/ref">
          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover/ref:bg-brand-blue/5 transition-all">
            <Hash className="h-3.5 w-3.5 text-slate-400 group-hover/ref:text-brand-blue" />
          </div>
          <span className="text-body-sm font-black text-slate-900 font-mono tracking-tighter">
            {p.orderReferenceNumber}
          </span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.CUSTOMER,
      sortable: true,
      sortKey: "customerName",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-inner">
            <User className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-body-sm text-slate-700 font-bold truncate">
              {p.customerName || `Order #${p.orderId}`}
            </span>
          </div>
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
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shadow-sm ${isCash ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                isGCash ? 'bg-blue-50 border-blue-100 text-blue-600' :
                  'bg-purple-50 border-purple-100 text-purple-600'
              }`}>
              {isCash ? <Banknote className="h-4 w-4" /> : isGCash ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{p.paymentMethod}</span>
              {p.paymentReference && (
                <span className="text-[9px] font-mono text-slate-400 tracking-tighter">ID: {p.paymentReference}</span>
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
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" />
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
        <div className="flex items-center justify-end gap-2 group-hover:translate-x-1 transition-transform">
          <CurrencyDisplay amount={p.amountPaid} size="sm" numberClassName="text-slate-900 font-black" />
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-brand-blue transition-colors" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-grid-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-grid-6 print:hidden">
        <div className="flex items-center gap-grid-4">
          <div className="h-12 w-12 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center shadow-sm">
            <FileText className="h-6 w-6 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-slate-900 font-black text-xl tracking-tight leading-none mb-1.5">{UI_LABELS.modules.reports.SALES_HISTORY}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
              {label || `DETAILED BREAKDOWN — ${date}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-grid-4 no-print">
          <Input
            placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="w-full md:w-80 h-14 rounded-xl border-slate-200 bg-white shadow-sm"
          />
          <Button
            variant="outline"
            className="h-14 px-grid-8 gap-grid-3 text-caption font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-300 rounded-xl"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            {UI_LABELS.modules.reports.EXPORT_CSV}
          </Button>
        </div>
      </div>

      <div className="relative group/ledger">
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-grid-6 bg-white border border-slate-200/60 rounded-[2rem] px-grid-10 py-grid-8 flex items-center justify-between shadow-xl shadow-slate-200/20 group/total"
          >
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(21,72,157,0.4)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover/total:text-brand-blue transition-colors duration-300">
                SESSION TOTAL
              </span>
            </div>
            <CurrencyDisplay
              amount={payments.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)}
              size="xl"
              className="text-slate-900 group-hover/total:scale-105 transition-transform duration-500"
              numberClassName="font-black"
            />
          </motion.div>
        )}
      </div>

      <div className="no-print">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={params.size}
          onPageChange={(p) => updateParams({ page: p })}
          onPageSizeChange={(s) => updateParams({ size: s, page: 0 })}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
