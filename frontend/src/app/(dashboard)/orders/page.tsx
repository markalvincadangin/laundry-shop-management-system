"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { 
  ShoppingBag,
  Activity,
  CheckCircle,
  CreditCard,
  Plus,
  ArrowUpRight,
  User,
  Package,
  ClipboardList,
  Search,
  RefreshCcw
} from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { useOrders } from "@/hooks/useOrders";
import { useRegistry } from "@/hooks/useRegistry";
import { 
  StatusBadge, 
  PaymentStatusBadge,
  KPICard, 
  Button, 
  Input,
  Select 
} from "@/components/ui";
import { DataTable, FilterBar, Pagination, EmptyState, ErrorState } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTableColumn } from "@/types/components";

/**
 * OrdersPage
 * Central registry for managing laundry orders.
 * Aligned with FRONT-001 HCI standards for touch targets and high-density layouts.
 */
export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Registry State Management (Centralized Architecture)
  const { 
    params, 
    page, 
    size,
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

  const { 
    orders, 
    stats, 
    loading, 
    error,
    pagination, 
    refresh 
  } = useOrders(params as any);

  const columns: DataTableColumn<any>[] = [
    {
      header: UI_LABELS.shared.common.ORDER_NUMBER,
      sortable: true,
      sortKey: "referenceNumber",
      render: (order) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-black text-slate-900 group-hover:text-brand-blue transition-colors font-mono">
              {order.referenceNumber}
            </span>
            {(order.serviceName?.includes("Rush") || order.serviceRateId === 2) && (
              <StatusBadge label="RUSH" variant="rush" className="px-1.5 py-0.5 text-[8px]" />
            )}
          </div>
          <div className="flex items-center gap-grid-1.5 mt-grid-1">
             <User className="h-3 w-3 text-slate-400" />
              <span className="text-caption text-slate-500 font-black uppercase tracking-tight">
                {order.customerName || UI_LABELS.shared.common.NAME}
              </span>
          </div>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.DETAILS,
      render: (order) => (
        <div className="flex items-center gap-grid-3 text-caption text-slate-500">
          <span className="flex items-center gap-grid-1"><Package className="h-3.5 w-3.5" /> {order.totalLoads} {UI_LABELS.shared.units.LOADS}</span>
          <span className="flex items-center gap-grid-1 font-medium">{formatWeight(order.weightKg)}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      sortable: true,
      sortKey: "currentStatus",
      render: (order) => <StatusBadge status={order.currentStatus ?? ""} />,
    },
    {
      header: UI_LABELS.layout.nav.PAYMENTS,
      sortable: true,
      sortKey: "paymentStatus",
      render: (order) => <PaymentStatusBadge status={order.paymentStatus ?? ""} />,
    },
    {
      header: UI_LABELS.shared.common.TOTAL,
      sortable: true,
      sortKey: "grandTotal",
      align: "right",
      render: (order) => (
        <div className="flex items-center justify-end gap-grid-1.5 text-body-sm font-black text-slate-900 group-hover:text-brand-blue transition-colors">
          {formatCurrency(order.grandTotal)}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
      <PageHeader 
        title={UI_LABELS.layout.nav.ORDERS}
        subtitle={UI_LABELS.modules.orders.SUBTITLE}
        icon={ClipboardList}
        actions={
          <Button 
            variant="primary" 
            className="h-14 px-grid-8 gap-grid-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xl uppercase text-caption tracking-widest font-black rounded-2xl"
            onClick={() => router.push("/orders/new")}
          >
            <Plus className="h-5 w-5" />
            {UI_LABELS.modules.orders.CREATE_TITLE || "New Order"}
          </Button>
        }
      />

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-grid-6">
          <KPICard title={UI_LABELS.modules.dashboard.KPI_TODAYS_ORDERS} value={stats.todaysOrders} subtitle={UI_LABELS.modules.dashboard.CREATED_TODAY} icon={ShoppingBag} />
          <KPICard title={UI_LABELS.modules.dashboard.KPI_ACTIVE_LOADS} value={stats.inProgress} subtitle={UI_LABELS.modules.dashboard.CURR_PROCESSING} variant="accent" icon={Activity} />
          <KPICard title={UI_LABELS.modules.dashboard.KPI_READY_PICKUP} value={stats.readyForPickup} subtitle={UI_LABELS.modules.dashboard.WAITING_CUST} variant="success" icon={CheckCircle} />
          <KPICard title={UI_LABELS.modules.dashboard.AWAITING_PAYMENT} value={stats.unpaidOrders} subtitle={UI_LABELS.shared.status.UNPAID} variant="warning" icon={CreditCard} />
        </div>
      )}

      {/* Filter & Search Bar */}
      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="flex-[2] min-w-[240px]">
          <Input
            placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <Select
            label={UI_LABELS.shared.common.STATUS}
            value={params.status ?? ""}
            onChange={(e) => updateParams({ status: e.target.value || undefined })}
            className="border-slate-200 bg-white"
          >
            <option value="">{UI_LABELS.shared.common.ALL_STATUSES}</option>
            <option value="RECEIVED">{UI_LABELS.shared.status.RECEIVED}</option>
            <option value="WASHING">{UI_LABELS.shared.status.WASHING}</option>
            <option value="DRYING">{UI_LABELS.shared.status.DRYING}</option>
            <option value="FOLDING">{UI_LABELS.shared.status.FOLDING}</option>
            <option value="READY_FOR_PICKUP">{UI_LABELS.shared.status.READY_FOR_PICKUP}</option>
            <option value="RELEASED">{UI_LABELS.shared.status.RELEASED}</option>
            <option value="CANCELLED">{UI_LABELS.shared.status.CANCELLED}</option>
          </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <Select
            label={UI_LABELS.layout.nav.PAYMENTS}
            value={params.paymentStatus ?? ""}
            onChange={(e) => updateParams({ paymentStatus: e.target.value || undefined })}
            className="border-slate-200 bg-white"
          >
            <option value="">{UI_LABELS.shared.common.ALL_PAYMENTS}</option>
            <option value="UNPAID">{UI_LABELS.shared.status.UNPAID}</option>
            <option value="PAID">{UI_LABELS.shared.status.PAID}</option>
          </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <Input label={UI_LABELS.shared.common.START_DATE} type="date" value={params.from ?? ""} onChange={(e) => updateParams({ from: e.target.value || undefined })} className="border-slate-200 bg-white" />
        </div>
        <div className="flex-1 min-w-[180px]">
          <Input label={UI_LABELS.shared.common.END_DATE} type="date" value={params.to ?? ""} onChange={(e) => updateParams({ to: e.target.value || undefined })} className="border-slate-200 bg-white" />
        </div>
        <Button variant="secondary" className="h-14 px-grid-8 gap-grid-2 uppercase text-caption tracking-widest font-black shadow-sm border-slate-200" onClick={() => refresh()}>
          <RefreshCcw className="h-4 w-4" />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="space-y-grid-6">
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={(order) => router.push(`/orders/${order.id}`)}
          emptyState={
            <EmptyState
              title={UI_LABELS.feedback.empty.ORDERS_TITLE}
              description={UI_LABELS.feedback.empty.ORDERS_DESC}
            />
          }
        />

        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={params.size}
          onPageChange={(page) => updateParams({ page })}
          onPageSizeChange={(newSize) => updateParams({ size: newSize, page: 0 })}
          isLoading={loading}
        />
      </div>
      )}
    </div>
  );
}


