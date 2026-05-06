"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  RefreshCcw, 
  BadgeCheck, 
  AlertCircle,
  User,
  Hash,
  Clock,
  ArrowRight
} from "lucide-react";
import { 
  Button, 
  StatusBadge,
  Input,
  Select 
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { DataTable, EmptyState, Pagination, FilterBar, ErrorState } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { formatDateTime } from "@/lib/utils";
import { DataTableColumn } from "@/types/components";
import { useClientAlerts } from "@/hooks/useClientAlerts";
import { useRegistry } from "@/hooks/useRegistry";
import { ClientAlertResponse } from "@/services/client-alerts.service";
import { ClientAlertDetailsModal } from "@/components/features/client-alerts/ClientAlertDetailsModal";
import { motion } from "framer-motion";

/**
 * Messaging Page (Communication Ledger) — High Fidelity (v5.0)
 * Standardized with professional administrative patterns.
 * Consolidates actions and filters for maximum spatial efficiency.
 */
export default function MessagingPage() {
  const { 
    params, 
    searchTerm, 
    setSearchTerm, 
    updateParams, 
    handleSort,
    sortBy,
    sortDir
  } = useRegistry({
    defaultSortBy: "createdAt",
    defaultSortDir: "desc",
    defaultPageSize: 20
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
      sortKey: "referenceNumber",
      render: (n) => (
        <div className="flex items-center gap-3 group">
           <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-brand-blue/5 transition-all">
              <Hash className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-blue" />
           </div>
           <span className="font-mono text-body-sm text-slate-900 font-bold tracking-tight truncate">
             {n.referenceNumber}
           </span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.CUSTOMER,
      sortable: true,
      sortKey: "customerName",
      render: (n) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
             <User className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-body-sm text-slate-700 font-bold truncate">
              {n.customerName || "Walk-in Customer"}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-70">
              Recipient
            </span>
          </div>
        </div>
      ),
    },
    {
      header: UI_LABELS.modules.clientAlerts.MESSAGE,
      render: (n) => (
        <div className="max-w-[280px] xl:max-w-md">
           <p className="text-body-sm text-slate-500 line-clamp-1 leading-relaxed italic opacity-80">
             &quot;{n.message}&quot;
           </p>
        </div>
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
            label={isSent ? "MESSAGE SENT" : "DELIVERY FAILED"} 
            icon={isSent ? BadgeCheck : AlertCircle}
            className="font-bold tracking-widest text-[9px]"
          />
        );
      },
    },
    {
      header: UI_LABELS.modules.clientAlerts.LOGGED_AT,
      sortable: true,
      sortKey: "createdAt",
      render: (n) => (
        <div className="flex items-center gap-3 text-slate-500">
           <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
           </div>
           <div className="flex flex-col">
             <span className="text-body-sm font-bold text-slate-700 tabular-nums">
               {formatDateTime(n.createdAt).split(',')[0]}
             </span>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
               {formatDateTime(n.createdAt).split(',')[1]}
             </span>
           </div>
        </div>
      ),
    },
    {
      header: "",
      align: "right",
      render: (n) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-11 px-5 gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-2xl transition-all border border-transparent hover:border-brand-blue/10 active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(n);
          }}
        >
          {UI_LABELS.shared.common.DETAILS}
          <ArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-8 pb-grid-20 px-4 md:px-0">
      <PageHeader 
        variant="premium"
        title={UI_LABELS.modules.clientAlerts.TITLE}
        subtitle={UI_LABELS.modules.clientAlerts.SUBTITLE}
        icon={MessageSquare}
      />

      {/* ── Filter Bar with Integrated Refresh ── */}
      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="w-full lg:flex-[2] lg:min-w-[280px]">
          <Input
            placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-13 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[180px]">
          <Select
            value={params.status ?? ""}
            onChange={(e) => updateParams({ status: e.target.value, page: 0 })}
            className="h-13 rounded-xl border-slate-200 bg-white/50 shadow-sm"
          >
            <option value="">All Delivery Statuses</option>
            <option value="SENT">Sent Successfully</option>
            <option value="FAILED">Action Required (Failed)</option>
          </Select>
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[150px]">
          <Input
            type="date"
            value={params.from ?? ""}
            onChange={(e) => updateParams({ from: e.target.value, page: 0 })}
            className="h-13 rounded-xl border-slate-200 bg-white/50 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button 
            variant="secondary" 
            className="flex-1 lg:flex-none h-13 px-grid-6 gap-grid-2 uppercase text-[10px] tracking-widest font-black border-slate-200 bg-white shadow-sm hover:bg-slate-50 rounded-xl" 
            onClick={() => refresh()}
            isLoading={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {UI_LABELS.shared.common.REFRESH}
          </Button>
        </div>
      </FilterBar>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-grid-6"
        >
          <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
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
                  icon={<MessageSquare className="h-16 w-16 text-slate-100" />}
                />
              }
            />
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            pageSize={params.size}
            onPageChange={(page) => updateParams({ page })}
            onPageSizeChange={(newSize) => updateParams({ size: newSize, page: 0 })}
            isLoading={loading}
          />
        </motion.div>
      )}

      <ClientAlertDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notification={selectedNotification}
      />
    </div>
  );
}
