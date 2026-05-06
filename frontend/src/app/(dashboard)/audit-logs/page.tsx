"use client";

import { useState } from "react";
import { 
  History, 
  RefreshCcw, 
  User, 
  Clock, 
  Eye, 
  Search, 
  Database, 
  Activity, 
  ShieldCheck,
  ChevronRight,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
 * Audit Log Page (System Audit Trail) — High Fidelity (v4.0)
 * Provides full forensic transparency for all system mutations.
 * Adheres to FRONT-001 §11.4 (Security & Audit Trail).
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
        const op = a.operation as string;
        let variant: "neutral" | "success" | "warning" | "error" | "primary" | "action" = "neutral";
        
        if (op === "INSERT") variant = "success";
        else if (op === "UPDATE") variant = "warning";
        else if (op === "DELETE") variant = "error";
        else if (op === "PAYMENT_RECORD") variant = "success";
        else if (op === "USER_LOGIN" || op === "USER_LOGOUT") variant = "primary";
        else if (op === "ORDER_STATUS_UPDATE") variant = "action";

        const label = UI_LABELS.modules.auditLog.ACTION_MAP[op || ""] || op;

        return (
          <StatusBadge 
            variant={variant} 
            label={label} 
            className="font-bold tracking-tight uppercase"
          />
        );
      },
    },
    {
      header: UI_LABELS.modules.auditLog.ENTITY,
      sortable: true,
      sortKey: "entityType",
      render: (a) => {
        const moduleName = a.entityType ? (UI_LABELS.modules.auditLog.TABLE_MAP[a.entityType] || a.entityType.replace(/_/g, " ")) : UI_LABELS.shared.common.SYSTEM;
        const hasId = a.entityId && a.entityId !== "N/A";

        return (
          <div className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-brand-blue/5 group-hover:border-brand-blue/10 transition-all">
              <Database className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-blue" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-body-sm font-bold text-slate-700 truncate group-hover:text-brand-blue transition-colors">
                {moduleName}
              </span>
              {hasId && (
                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit">
                  #{a.entityId}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: UI_LABELS.modules.auditLog.OPERATOR,
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
        
        const actorName = formatUser(a.actor);
        const isSystem = actorName === UI_LABELS.shared.common.SYSTEM;

        return (
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shadow-sm transition-all ${
              isSystem ? "bg-slate-50 border-slate-100" : "bg-brand-blue/5 border-brand-blue/10"
            }`}>
              <User className={`h-4 w-4 ${isSystem ? "text-slate-400" : "text-brand-blue"}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-body-sm font-black ${isSystem ? "text-slate-500" : "text-slate-900"}`}>
                {actorName}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-70">
                {isSystem ? "Automated Flow" : "Authorized User"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: UI_LABELS.shared.common.TIME,
      sortable: true,
      sortKey: "createdAt",
      render: (a) => (
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-body-sm font-black text-slate-700">
              {formatDateTime(a.createdAt).split(",")[0]}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {formatDateTime(a.createdAt).split(",")[1]}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "",
      align: "right",
      render: (a) => (
        <Button 
          variant="ghost" 
          size="sm"
          className="h-11 px-5 gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-2xl transition-all border border-transparent hover:border-brand-blue/10 active:scale-95"
          onClick={() => setSelected(a)}
        >
          <Activity className="h-4 w-4" />
          {UI_LABELS.shared.common.DETAILS}
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-8 pb-grid-20 px-4 md:px-0">
      <PageHeader 
        variant="premium"
        title={UI_LABELS.modules.auditLog.TITLE}
        subtitle={UI_LABELS.modules.auditLog.SUBTITLE}
        icon={History}
      />

      {/* ── Filter Bar with Glass Effect ── */}
      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="w-full lg:flex-[2] lg:min-w-[280px]">
          <Input
            placeholder={UI_LABELS.modules.auditLog.SEARCH_LOGS}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-13 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[180px]">
          <Select
            value={params.action ?? ""}
            onChange={(e) => updateParams({ action: e.target.value, page: 0 })}
            className="h-13 rounded-xl border-slate-200 bg-white/50 shadow-sm"
          >
            <option value="">{UI_LABELS.shared.common.ALL_ACTIONS}</option>
            <option value="INSERT">{UI_LABELS.modules.auditLog.ACTION_CREATED}</option>
            <option value="UPDATE">{UI_LABELS.modules.auditLog.ACTION_MODIFIED}</option>
            <option value="DELETE">{UI_LABELS.modules.auditLog.ACTION_REMOVED}</option>
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
                  icon={<History className="h-16 w-16 text-slate-100" />}
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

      {/* Details Modal */}
      <AuditLogDetailsModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        selected={selected}
      />
    </div>
  );
}
