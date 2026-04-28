"use client";

import React, { useState, useCallback } from "react";
import { 
  FileText, 
  Download,
  User,
  ArrowUpRight,
  Search
} from "lucide-react";
import { type OrderResponse } from "@/services/orders.service";
import { Card, Button, Input } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { UI_LABELS } from "@/constants/ui";
import { useOrders } from "@/hooks/useOrders";
import { Pagination, DataTable, FilterBar } from "@/features/shared";
import { DataTableColumn } from "@/types/components";
import { useDebounce } from "@/hooks/useDebounce";
import { useRegistry } from "@/hooks/useRegistry";

import { DetailedSalesTableProps } from "@/types/components";

/**
 * Detailed Sales Table (Ledger)
 * Standardized with Universal DataTable engine and sorting.
 * Adheres to FRONT-001 §4.2 and FRONT-002 §8.1.
 */
export function DetailedSalesTable({ date, from, to, label }: DetailedSalesTableProps) {
  const { 
    params, 
    page, 
    sortBy, 
    sortDir, 
    searchTerm, 
    setSearchTerm, 
    updateParams, 
    handleSort 
  } = useRegistry({
    defaultSortBy: "createdAt",
    defaultSortDir: "desc",
    defaultPageSize: 10
  });

  const { orders, loading, pagination } = useOrders({
    ...params,
    from: from || date,
    to: to || date,
    paymentStatus: "PAID",
  });

  const columns: DataTableColumn<OrderResponse>[] = [
    {
      header: UI_LABELS.shared.common.REFERENCE,
      sortable: true,
      sortKey: "referenceNumber",
      render: (o) => (
        <span className="text-sm font-bold text-slate-900 font-mono group-hover:text-brand-blue transition-colors">
          {o.referenceNumber}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.CUSTOMER,
      sortable: true,
      sortKey: "customer.lastName",
      render: (o) => (
        <div className="flex items-center gap-2">
           <User className="h-3.5 w-3.5 text-slate-400" />
           <span className="text-sm text-slate-700 font-bold">{o.customerName || `${UI_LABELS.shared.common.CUSTOMER} #${o.customerId}`}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.DETAILS,
      sortable: true,
      sortKey: "weightKg",
      render: (o) => (
        <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
          {o.totalLoads} {UI_LABELS.shared.units.LOADS} • {o.weightKg}{UI_LABELS.shared.units.WEIGHT}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.TOTAL,
      sortable: true,
      sortKey: "grandTotal",
      align: "right",
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-brand-blue">
          {formatCurrency(o.grandTotal)}
          <ArrowUpRight className="h-4 w-4" />
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
          <Button variant="outline" size="sm" className="h-10 px-6 gap-2 text-xs font-extrabold uppercase tracking-widest border-slate-200 shrink-0" onClick={() => window.print()}>
            <Download className="h-3.5 w-3.5" />
            {UI_LABELS.modules.reports.EXPORT}
          </Button>
        </div>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        density="compact"
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onRowClick={(o) => window.location.href = `/orders/${o.id}`}
      />

      {orders.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{UI_LABELS.shared.common.TOTAL}</span>
          <span className="text-3xl font-display font-black text-slate-900 tracking-tight">{formatCurrency(orders.reduce((sum, o) => sum + (o.grandTotal ?? 0), 0))}</span>
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
