"use client";

import { useState } from "react";
import { History, RefreshCcw, User, Clock, Eye, Search } from "lucide-react";
import { 
  Button, 
  StatusBadge,
  Input,
  Select
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, EmptyState, FilterBar, Pagination, ErrorState, AccessDenied, LoadingState } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { formatDateTime } from "@/lib/utils";
import { DataTableColumn } from "@/types/components";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useRegistry } from "@/hooks/useRegistry";
import { AuditLogResponse } from "@/services/audit-log.service";
import { AuditLogDetailsModal } from "@/components/features/audit-log/AuditLogDetailsModal";

/**
 * Audit Log Page (System Audit Trail)
 * Standardized with HCI-compliant URL sync and server-side filtering.
 */
export default function AuditLogPage() {
  const { user, loading: authLoading } = useAuth();

  // Registry State Management (Centralized Architecture)
  const { 
    params, 
    sortBy, 
    sortDir, 
    searchTerm, 
    setSearchTerm, 
    updateParams, 
    handleSort 
  } = useRegistry({
    defaultSortBy: "createdAt",
    defaultSortDir: "desc",
    defaultPageSize: 20
  });

  const { logs, pagination, loading, error, refresh } = useAuditLog(params as any);
  const [selected, setSelected] = useState<AuditLogResponse | null>(null);

  if (authLoading) return <LoadingState fullPage />;
  if (user?.role !== "ADMIN") return <AccessDenied />;

  const columns: DataTableColumn<AuditLogResponse>[] = [
    {
      header: UI_LABELS.modules.auditLog.ACTION,
      sortable: true,
      sortKey: "operation",
      render: (a) => {
        let variant: "neutral" | "success" | "warning" | "error" = "neutral";
        if (a.operation === "INSERT") variant = "success";
        if (a.operation === "UPDATE") variant = "warning";
        if (a.operation === "DELETE") variant = "error";

        return (
          <StatusBadge 
            variant={variant} 
            label={UI_LABELS.modules.auditLog.ACTION_MAP[a.operation || ""] || a.operation} 
            className="w-24 justify-center"
          />
        );
      },
    },
    {
      header: UI_LABELS.modules.auditLog.ENTITY,
      sortable: true,
      sortKey: "entityType",
      render: (a) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {a.entityType ? (UI_LABELS.modules.auditLog.TABLE_MAP[a.entityType] || a.entityType.replace("_", " ")) : UI_LABELS.shared.common.SYSTEM}
          </span>
          <span className="text-body-sm font-black text-slate-900 group-hover:text-brand-blue transition-colors">
            {a.entityType || UI_LABELS.shared.common.SYSTEM}
          </span>
          <span className="text-sm font-mono text-slate-700 font-bold">
            {UI_LABELS.shared.common.ID}: {a.entityId}
          </span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.USER,
      sortable: true,
      sortKey: "actor",
      render: (a) => {
        const formatUser = (userStr?: string) => {
          if (!userStr || userStr === "anonymous") return UI_LABELS.shared.common.SYSTEM;
          if (userStr.includes("username=")) {
            const match = userStr.match(/username=([^,\]]+)/);
            return match ? match[1] : userStr;
          }
          return userStr;
        };
        
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
              <User className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <span className="text-sm text-slate-600 font-semibold">
              {formatUser(a.actor)}
            </span>
          </div>
        );
      },
    },
    {
      header: UI_LABELS.shared.common.TIME,
      sortable: true,
      sortKey: "createdAt",
      render: (a) => (
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {formatDateTime(a.createdAt)}
          </span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.ACTIONS,
      align: "right",
      render: (a) => (
        <Button 
          variant="ghost" 
          size="sm"
          className="h-9 px-3 gap-2 text-[10px] font-black uppercase tracking-tighter"
          onClick={() => setSelected(a)}
        >
          <Eye className="h-3.5 w-3.5" />
          {UI_LABELS.shared.common.DETAILS}
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
      <PageHeader 
        title={UI_LABELS.modules.auditLog.TITLE}
        subtitle={UI_LABELS.modules.auditLog.SUBTITLE}
        icon={History}
      />

      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="w-full lg:flex-[2] lg:min-w-[200px]">
          <Input
            placeholder={UI_LABELS.modules.auditLog.SEARCH_LOGS}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[150px]">
          <Select
            value={params.action ?? ""}
            onChange={(e) => updateParams({ action: e.target.value, page: 0 })}
            className="h-14 rounded-xl border-slate-200 bg-white"
          >
            <option value="">{UI_LABELS.shared.common.ALL_ACTIONS}</option>
            <option value="INSERT">{UI_LABELS.modules.auditLog.ACTION_CREATED}</option>
            <option value="UPDATE">{UI_LABELS.modules.auditLog.ACTION_MODIFIED}</option>
            <option value="DELETE">{UI_LABELS.modules.auditLog.ACTION_REMOVED}</option>
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
        <Button 
          variant="secondary" 
          className="w-full lg:w-auto h-14 px-grid-8 gap-grid-2 uppercase text-caption tracking-widest font-black shadow-sm border-slate-200 shrink-0"
          onClick={() => refresh()}
          isLoading={loading}
        >
          <RefreshCcw className="h-4 w-4" />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="space-y-grid-6">
          <DataTable
            data={logs}
            columns={columns}
            loading={loading}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={(a) => setSelected(a)}
            emptyState={
              <EmptyState
                title={UI_LABELS.feedback.empty.AUDIT_LOG_TITLE}
                description={UI_LABELS.feedback.empty.AUDIT_LOG_DESC}
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

      {/* Details Modal */}
      <AuditLogDetailsModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        selected={selected}
      />
    </div>
  );
}
