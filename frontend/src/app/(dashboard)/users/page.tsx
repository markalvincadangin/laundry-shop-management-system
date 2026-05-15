"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  RefreshCcw, 
  ShieldCheck, 
  ShieldAlert,
  Settings2,
  Power,
  Search,
  Shield,
  Activity,
  UserCheck,
  ShieldHalf
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout";
import { 
  Button, 
  StatusBadge, 
  Avatar,
  Input,
  TableSkeleton,
  ConfirmDialog,
  KPICard
} from "@/components/ui";
import { DataTable, EmptyState, AccessDenied, FilterBar, Pagination } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { useUsers } from "@/hooks/useUsers";
import { UserResponse } from "@/services/users.service";
import { DataTableColumn } from "@/types/components";
import { UserModal } from "@/components/features/users/UserModal";
import { formatDate } from "@/lib/utils";
import { useRegistry } from "@/hooks/useRegistry";

/**
 * Staff Management Page — High Fidelity (v5.0)
 * Allows Admins to onboard, modify, and deactivate staff accounts.
 * Adheres to FRONT-001 §7 and §3.1.6.
 * v4.0 Consistency Pass: Premium PageHeader, consistent grid width, and refined spacing.
 */
export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
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
    defaultSortBy: "username",
    defaultSortDir: "asc",
    defaultPageSize: 20,
    searchParamKey: "q"
  });

  const { users, stats, pagination, loading, refresh, toggleStatus } = useUsers(params as any);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status Confirmation State
  const [confirmStatusUser, setConfirmStatusUser] = useState<UserResponse | null>(null);

  const adminCount = stats?.totalAdmins ?? 0;
  const activeCount = stats?.totalActiveStaff ?? 0;
  const totalCount = stats?.totalUsers ?? 0;

  if (authLoading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
        <PageHeader title={UI_LABELS.modules.users.TITLE} subtitle={UI_LABELS.modules.users.SUBTITLE} icon={Users} />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (currentUser?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  const handleEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleToggleConfirm = () => {
    if (confirmStatusUser) {
      toggleStatus(confirmStatusUser.id);
      setConfirmStatusUser(null);
    }
  };

  const columns: DataTableColumn<UserResponse>[] = [
    {
      header: UI_LABELS.modules.users.USERNAME,
      sortable: true,
      sortKey: "username",
      render: (u) => (
        <div className="flex items-center gap-grid-4 group">
          <Avatar 
            name={`${u.firstName} ${u.lastName}`} 
            size="md" 
            className="ring-2 ring-white shadow-sm group-hover:scale-105 transition-all"
          />
          <div className="flex flex-col">
            <span className="text-body-sm font-black text-slate-900 leading-tight group-hover:text-brand-blue transition-colors">
              {u.username}
            </span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
              {u.firstName} {u.lastName}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.ROLE,
      sortable: true,
      sortKey: "role",
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-lg flex items-center justify-center border ${
            u.role === "ADMIN" ? "bg-brand-blue/5 border-brand-blue/10" : "bg-slate-50 border-slate-100"
          }`}>
            <Shield className={`h-3.5 w-3.5 ${u.role === "ADMIN" ? "text-brand-blue" : "text-slate-400"}`} />
          </div>
          <span className={`text-[10px] font-black px-grid-2.5 py-grid-1 rounded-md border uppercase tracking-widest ${
            u.role === "ADMIN" 
              ? "bg-brand-blue/5 border-brand-blue/20 text-brand-blue" 
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            {u.role === "ADMIN" ? UI_LABELS.modules.users.ROLE_ADMIN : UI_LABELS.modules.users.ROLE_STAFF}
          </span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      sortable: true,
      sortKey: "isActive",
      render: (u) => (
        <StatusBadge 
          variant={u.isActive ? "success" : "neutral"} 
          label={u.isActive ? UI_LABELS.shared.common.ACTIVE : UI_LABELS.shared.common.INACTIVE}
          icon={u.isActive ? ShieldCheck : ShieldAlert}
          className="shadow-sm"
        />
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      sortable: true,
      sortKey: "createdAt",
      render: (u) => (
        <div className="flex items-center gap-3 text-slate-500">
          <div className="flex flex-col">
            <span className="text-body-sm text-slate-600 font-bold">{formatDate(u.createdAt)}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{UI_LABELS.modules.users.JOINED}</span>
          </div>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.ACTIONS,
      align: "right",
      render: (u) => {
        const isSelf = currentUser?.userId === u.id;
        
        return (
          <div className="flex items-center justify-end">
            <Button 
              variant="ghost" 
              size="xs" 
              onClick={() => handleEdit(u)}
              className="w-9 p-0 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
              title={UI_LABELS.shared.buttons.EDIT}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-slate-100 mx-3" />
            <Button 
              variant="ghost" 
              size="xs" 
              disabled={isSelf}
              onClick={() => setConfirmStatusUser(u)}
              className={`w-9 p-0 transition-all ${
                isSelf 
                  ? "opacity-20 cursor-not-allowed text-slate-200" 
                  : u.isActive 
                    ? "text-rose-400 hover:text-rose-600 hover:bg-rose-50" 
                    : "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
              title={isSelf ? "You cannot deactivate your own account" : u.isActive ? "Deactivate User" : "Activate User"}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
      <PageHeader
        variant="premium"
        title={UI_LABELS.modules.users.TITLE}
        subtitle={UI_LABELS.modules.users.SUBTITLE}
        icon={Users}
        actions={
          <Button 
            className="h-14 px-grid-8 gap-grid-3 bg-brand-blue shadow-lg shadow-brand-blue/25 uppercase font-black text-caption tracking-widest active:scale-95 transition-all rounded-xl"
            onClick={handleCreate}
          >
            <UserPlus className="h-5 w-5" />
            {UI_LABELS.modules.users.CREATE}
          </Button>
        }
      />

      {/* Snapshot KPIs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-grid-6"
      >
        <KPICard title="Total Staff" value={totalCount} subtitle="Onboarded Accounts" icon={Users} variant="default" />
        <KPICard title="Administrators" value={adminCount} subtitle="Full Access Control" icon={ShieldHalf} variant="accent" />
        <KPICard title="Active Status" value={activeCount} subtitle="Currently Authorized" icon={UserCheck} variant="success" />
      </motion.div>

      {/* ── Filter Bar ── */}
      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="flex-[3] min-w-[300px]">
          <Input
            placeholder={UI_LABELS.modules.users.SEARCH_USERS}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-2xl border-slate-200 bg-white shadow-sm"
          />
        </div>
        <Button 
          variant="secondary" 
          className="h-14 px-grid-8 gap-grid-2 border-slate-200 bg-white text-caption font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 rounded-2xl"
          onClick={() => refresh()}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-grid-6"
      >
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          emptyState={
            <EmptyState
              title={UI_LABELS.modules.users.EMPTY_TITLE}
              description={UI_LABELS.modules.users.EMPTY_DESC}
              icon={<Users className="h-16 w-16 text-slate-100" />}
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
      </motion.div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={() => refresh()}
      />

      <ConfirmDialog
        isOpen={!!confirmStatusUser}
        title={confirmStatusUser?.isActive ? "Deactivate User?" : "Reactivate User?"}
        description={confirmStatusUser?.isActive 
          ? "This will restrict the user from accessing the administrative dashboard. Their past actions will remain in the audit logs."
          : "This will restore the user's access to the administrative dashboard based on their assigned role."}
        confirmText={confirmStatusUser?.isActive ? "Deactivate" : "Activate"}
        isDestructive={confirmStatusUser?.isActive}
        icon={confirmStatusUser?.isActive ? ShieldAlert : ShieldCheck}
        onConfirm={handleToggleConfirm}
        onCancel={() => setConfirmStatusUser(null)}
      />
    </div>
  );
}
