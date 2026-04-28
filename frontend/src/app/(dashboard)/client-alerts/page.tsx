"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, Search, RefreshCcw, Eye, BadgeCheck, AlertCircle } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Button, 
  StatusBadge,
  Input,
  Select 
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { DataTable, EmptyState, Pagination, FilterBar, ErrorState } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { formatDate } from "@/lib/utils";
import { DataTableColumn } from "@/types/components";
import { useClientAlerts } from "@/hooks/useClientAlerts";
import { useRegistry } from "@/hooks/useRegistry";
import { ClientAlertResponse } from "@/services/client-alerts.service";
import { ClientAlertDetailsModal } from "@/features/client-alerts";

/**
 * Client Alerts Page (Audit Log)
 * Standardized with URL sync, sorting, and server-side filtering.
 */
export default function ClientAlertsPage() {
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
    defaultPageSize: 15
  });

  const { alerts, pagination, loading, error, refresh } = useClientAlerts(params as any);

  const [selectedNotification, setSelectedNotification] = useState<ClientAlertResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (notification: ClientAlertResponse) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const columns: DataTableColumn<ClientAlertResponse>[] = [
    {
      header: UI_LABELS.shared.common.ORDER_NUMBER,
      sortable: true,
      sortKey: "order.referenceNumber",
      render: (n) => (
        <span className="font-mono text-[12px] text-slate-900 font-black tracking-tight">
          {n.referenceNumber}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.CUSTOMER,
      sortable: true,
      sortKey: "order.customer.lastName",
      render: (n) => (
        <span className="text-sm text-slate-700 font-medium">
          {n.customerName || UI_LABELS.shared.common.CUSTOMER}
        </span>
      ),
    },
    {
      header: UI_LABELS.modules.clientAlerts.MESSAGE,
      sortable: true,
      sortKey: "message",
      render: (n) => (
        <span className="text-sm text-slate-500 max-w-sm block leading-relaxed font-medium">
          {n.message}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      sortable: true,
      sortKey: "status",
      render: (n) => {
        const isSent = n.status === "SENT";
        return (
          <StatusBadge 
            variant={isSent ? "success" : "error"} 
            label={isSent ? UI_LABELS.modules.clientAlerts.STATUS_VERIFIED : UI_LABELS.modules.clientAlerts.STATUS_ACTION_REQUIRED} 
            icon={isSent ? BadgeCheck : AlertCircle}
          />
        );
      },
    },
    {
      header: UI_LABELS.modules.clientAlerts.LOGGED_AT,
      sortable: true,
      sortKey: "createdAt",
      render: (n) => (
        <span className="text-xs text-slate-400 font-medium">
          {formatDate(n.createdAt)}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.ACTIONS,
      align: "right",
      render: (n) => (
        n.orderId ? (
          <Link href={`/orders/${n.orderId}`} onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="lg" 
              className="h-12 text-brand-cyan-dark hover:text-brand-blue hover:bg-brand-cyan/5 border border-transparent hover:border-brand-cyan/20 font-bold uppercase text-xs tracking-widest px-6 transition-all gap-2"
            >
              {UI_LABELS.modules.clientAlerts.VIEW_ORDER}
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : null
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
      <PageHeader 
        title={UI_LABELS.modules.clientAlerts.TITLE}
        subtitle={UI_LABELS.modules.clientAlerts.SUBTITLE}
        icon={Bell}
        actions={
          <Button 
            variant="secondary" 
            className="h-12 px-6 gap-2 text-xs font-bold uppercase tracking-widest"
            onClick={() => refresh()}
            isLoading={loading}
          >
            <RefreshCcw className="h-4 w-4" />
            {UI_LABELS.shared.common.REFRESH}
          </Button>
        }
      />

      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="w-full lg:flex-[2] lg:min-w-[240px]">
          <Input
            placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[150px]">
          <Select
            value={params.status ?? ""}
            onChange={(e) => updateParams({ status: e.target.value, page: 0 })}
            className="h-14 rounded-xl border-slate-200 bg-white"
          >
            <option value="">{UI_LABELS.shared.common.ALL_STATUSES}</option>
            <option value="SENT">{UI_LABELS.modules.clientAlerts.STATUS_VERIFIED}</option>
            <option value="FAILED">{UI_LABELS.modules.clientAlerts.STATUS_ACTION_REQUIRED}</option>
          </Select>
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[150px]">
          <Input
            label={UI_LABELS.shared.common.START_DATE}
            type="date"
            value={params.from ?? ""}
            onChange={(e) => updateParams({ from: e.target.value, page: 0 })}
            className="h-14 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[150px]">
          <Input
            label={UI_LABELS.shared.common.END_DATE}
            type="date"
            value={params.to ?? ""}
            onChange={(e) => updateParams({ to: e.target.value, page: 0 })}
            className="h-14 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <Button variant="secondary" className="w-full lg:w-auto h-14 px-grid-8 gap-grid-2 uppercase text-caption tracking-widest font-black shadow-sm border-slate-200" onClick={() => refresh()}>
          <RefreshCcw className="h-4 w-4" />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="space-y-grid-6">
          <DataTable
            data={alerts}
            columns={columns}
            loading={loading}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={handleRowClick}
            emptyState={
              <EmptyState
                title={UI_LABELS.feedback.empty.CLIENT_ALERTS_TITLE}
                description={UI_LABELS.feedback.empty.CLIENT_ALERTS_DESC}
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

      <ClientAlertDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notification={selectedNotification}
      />
    </div>
  );
}
