"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  RefreshCcw, 
  ShieldCheck, 
  ShieldAlert,
  Edit2,
  Power,
  Search,
  ChevronRight,
  Shield,
  Activity
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
  ConfirmDialog
} from "@/components/ui";
import { DataTable, EmptyState, AccessDenied, FilterBar, Pagination } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { useUsers } from "@/hooks/useUsers";
import { UserResponse } from "@/services/users.service";
import { DataTableColumn } from "@/types/components";
import { UserModal } from "@/components/features/users/UserModal";
import { formatDate } from "@/lib/utils";

/**
 * Staff Management Page — High Fidelity (v4.0)
 * Allows Admins to onboard, modify, and deactivate staff accounts.
 * Adheres to FRONT-001 §7 and §3.1.6.
 */
export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { users, pagination, loading, error, refresh, toggleStatus } = useUsers();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Status Confirmation State
  const [confirmStatusUser, setConfirmStatusUser] = useState<UserResponse | null>(null);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20 px-4 md:px-0">
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
      header: "",
      align: "right",
      render: (u) => {
        const isSelf = currentUser?.userId === u.id;
        
        return (
          <div className="flex items-center justify-end gap-grid-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEdit(u)}
              className="h-10 px-3 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {UI_LABELS.shared.buttons.EDIT}
            </Button>
            <div className="w-px h-4 bg-slate-100 mx-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={isSelf}
              onClick={() => setConfirmStatusUser(u)}
              className={`h-10 w-10 p-0 transition-all rounded-xl ${
                isSelf 
                  ? "opacity-20 cursor-not-allowed" 
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
    <div className="max-w-7xl mx-auto space-y-grid-8 pb-grid-20 px-4 md:px-0">
      <PageHeader
        title={UI_LABELS.modules.users.TITLE}
        subtitle={UI_LABELS.modules.users.SUBTITLE}
        icon={Users}
        actions={
          <Button 
            className="h-13 px-grid-8 gap-grid-3 bg-brand-blue shadow-lg shadow-brand-blue/25 uppercase font-black text-[11px] tracking-widest active:scale-95 transition-all rounded-xl"
            onClick={handleCreate}
          >
            <UserPlus className="h-5 w-5" />
            {UI_LABELS.modules.users.CREATE}
          </Button>
        }
        className="mb-grid-4"
      />

      {/* ── Filter Bar with Glass Effect ── */}
      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="flex-[3] min-w-[300px]">
          <Input
            placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-13 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
        </div>
        <Button 
          variant="secondary" 
          className="h-13 px-grid-8 gap-grid-2 border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 rounded-xl"
          onClick={() => refresh()}
          isLoading={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-grid-6"
      >
        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <DataTable
            data={filteredUsers}
            columns={columns}
            loading={loading}
            emptyState={
              <EmptyState
                title={UI_LABELS.modules.users.EMPTY_TITLE}
                description={UI_LABELS.modules.users.EMPTY_DESC}
                icon={<Users className="h-16 w-16 text-slate-100" />}
              />
            }
          />
        </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(filteredUsers.length / 20) || 1}
          totalElements={filteredUsers.length}
          pageSize={20}
          onPageChange={() => {}} // User list is usually small, but keeping standard
          onPageSizeChange={() => {}}
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
