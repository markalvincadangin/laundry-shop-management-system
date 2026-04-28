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
  Search
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout";
import { 
  Button, 
  StatusBadge, 
  Avatar,
  Input,
  TableSkeleton
} from "@/components/ui";
import { DataTable, EmptyState, AccessDenied, FilterBar, Pagination } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { useUsers } from "@/hooks/useUsers";
import { UserResponse } from "@/services/users.service";
import { DataTableColumn } from "@/types/components";
import { UserModal } from "@/components/features/users/UserModal";
import { formatDate } from "@/lib/utils";

/**
 * Staff Management Page
 * Allows Admins to onboard, modify, and deactivate staff accounts.
 * Adheres to FRONT-001 §7 and §3.1.6.
 */
export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { users, pagination, loading, error, refresh, toggleStatus } = useUsers();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
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

  const columns: DataTableColumn<UserResponse>[] = [
    {
      header: UI_LABELS.modules.users.USERNAME,
      render: (u) => (
        <div className="flex items-center gap-grid-3">
          <Avatar name={`${u.firstName} ${u.lastName}`} size="md" />
          <div className="flex flex-col">
            <span className="text-body-sm font-black text-slate-900 leading-tight">{u.username}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{u.firstName} {u.lastName}</span>
          </div>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.ROLE,
      render: (u) => (
        <span className={`text-[10px] font-black px-grid-2.5 py-grid-1 rounded-md border uppercase tracking-widest ${
          u.role === "ADMIN" 
            ? "bg-brand-blue/5 border-brand-blue/20 text-brand-blue" 
            : "bg-slate-50 border-slate-200 text-slate-500"
        }`}>
          {u.role === "ADMIN" ? UI_LABELS.modules.users.ROLE_ADMIN : UI_LABELS.modules.users.ROLE_STAFF}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      render: (u) => (
        <StatusBadge 
          variant={u.isActive ? "success" : "error"} 
          label={u.isActive ? UI_LABELS.shared.common.ACTIVE : UI_LABELS.shared.common.INACTIVE}
          icon={u.isActive ? ShieldCheck : ShieldAlert}
        />
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      render: (u) => (
        <div className="flex flex-col">
          <span className="text-body-sm text-slate-600 font-medium">{formatDate(u.createdAt)}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{UI_LABELS.modules.users.JOINED}</span>
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
              className="h-10 w-10 p-0 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={isSelf}
              onClick={() => toggleStatus(u.id)}
              className={`h-10 w-10 p-0 transition-all ${isSelf ? "opacity-20 cursor-not-allowed" : u.isActive ? "text-rose-400 hover:text-rose-600 hover:bg-rose-50" : "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
              title={isSelf ? "You cannot deactivate your own account" : ""}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
      <PageHeader
        title={UI_LABELS.modules.users.TITLE}
        subtitle={UI_LABELS.modules.users.SUBTITLE}
        icon={Users}
        actions={
          <Button 
            className="h-12 px-grid-8 gap-grid-2 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase font-black text-caption tracking-widest active:scale-95 transition-all"
            onClick={handleCreate}
          >
            <UserPlus className="h-5 w-5" />
            {UI_LABELS.modules.users.CREATE}
          </Button>
        }
      />

      <FilterBar title={UI_LABELS.shared.common.FILTER}>
        <div className="flex-[3] min-w-[300px]">
          <Input
            placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <Button 
          variant="secondary" 
          className="h-14 px-grid-8 gap-grid-2 border-slate-200 text-caption font-black uppercase tracking-widest shadow-sm"
          onClick={() => refresh()}
          isLoading={loading}
        >
          <RefreshCcw className="h-4 w-4" />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      <div className="space-y-grid-6">
        <DataTable
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyState={
            <EmptyState
              title={UI_LABELS.modules.users.EMPTY_TITLE}
              description={UI_LABELS.modules.users.EMPTY_DESC}
              icon={<Users className="h-12 w-12 text-slate-200" />}
            />
          }
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(filteredUsers.length / 20) || 1}
          totalElements={filteredUsers.length}
          pageSize={20}
          onPageChange={() => {}} // User list is usually small, but keeping standard
          onPageSizeChange={() => {}}
          isLoading={loading}
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={() => refresh()}
      />
    </div>
  );
}
