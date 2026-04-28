"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  Filter,
  Eye,
  PlusCircle,
  UserCog,
  Settings2
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Button,
  Input,
  Avatar,
  StatusBadge,
  Select
} from "@/components/ui";
import { DataTable, FilterBar, Pagination, EmptyState, ErrorState } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { CustomerEditModal } from "@/features/customers";
import { UI_LABELS } from "@/constants/ui";
import { formatDate } from "@/lib/utils";
import { useCustomers } from "@/hooks/useCustomers";
import { useRegistry } from "@/hooks/useRegistry";
import { CustomerResponse } from "@/services/customers.service";
import { DataTableColumn } from "@/types/components";
import type { components } from "@/types/api.generated";

export default function CustomersPage() {
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
    defaultSortBy: "lastName",
    defaultSortDir: "asc",
    defaultPageSize: 15
  });

  const { customers, loading, error, pagination, refresh } = useCustomers(params as any);

  const [selectedCustomer, setSelectedCustomer] = useState<components["schemas"]["CustomerResponse"] | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleRowClick = (customer: components["schemas"]["CustomerResponse"]) => {
    router.push(`/customers/${customer.id}`);
  };

  const columns: DataTableColumn<components["schemas"]["CustomerResponse"]>[] = [
    {
      header: UI_LABELS.shared.common.NAME,
      sortable: true,
      sortKey: "lastName",
      render: (c) => (
        <div className="flex items-center gap-grid-3">
          <Avatar name={`${c.firstName} ${c.lastName}`} size="md" />
          <div className="flex flex-col">
            <p className="text-body-sm font-black text-slate-900 leading-tight">
              {c.firstName} {c.lastName}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
              {UI_LABELS.shared.common.ID}: {c.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.CONTACT,
      sortable: true,
      sortKey: "contactNumber",
      render: (c) => (
        <div className="flex items-center gap-grid-2 text-body-sm font-medium text-slate-600">
          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="font-mono tracking-tight truncate">{c.contactNumber}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      sortable: true,
      sortKey: "createdAt",
      className: "hidden md:table-cell",
      render: (c) => (
          <span className="text-body-sm text-slate-600 font-medium">
            {formatDate(c.createdAt)}
          </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      sortable: true,
      sortKey: "isActive",
      render: (c) => (
        <StatusBadge 
          variant={c.isActive ? "success" : "neutral"} 
          label={c.isActive ? UI_LABELS.shared.common.ACTIVE : UI_LABELS.shared.common.INACTIVE} 
        />
      ),
    },
    {
      header: UI_LABELS.shared.common.ACTIONS,
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/customers/${c.id}`} onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue"
            >
              <Eye className="h-3.5 w-3.5" />
              {UI_LABELS.shared.common.DETAILS}
            </Button>
          </Link>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCustomer(c);
                setIsEditModalOpen(true);
              }}
              title={UI_LABELS.modules.customers.EDIT_PROFILE}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Link href={`/orders?new=true&customerId=${c.id}`} onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
                title={UI_LABELS.forms.intake.TITLE}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
      <PageHeader
        title={UI_LABELS.layout.nav.CUSTOMERS}
        subtitle={UI_LABELS.modules.customers.SUBTITLE}
        icon={Users}
        actions={
          <Button 
            className="h-12 px-grid-8 gap-grid-2 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase text-caption tracking-widest font-black"
            onClick={() => {
              setSelectedCustomer(null);
              setIsEditModalOpen(true);
            }}
          >
            <Plus className="h-5 w-5" />
            {UI_LABELS.modules.customers.REGISTER_NEW}
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
        <div className="w-full lg:flex-1 lg:min-w-[180px]">
          <Select
            label={UI_LABELS.shared.common.STATUS}
            value={params.isActive ?? ""}
            onChange={(e) => updateParams({ isActive: e.target.value || undefined, page: 0 })}
            className="border-slate-200 bg-white h-14"
          >
            <option value="">{UI_LABELS.shared.common.ALL_STATUSES}</option>
            <option value="true">{UI_LABELS.shared.common.ACTIVE}</option>
            <option value="false">{UI_LABELS.shared.common.INACTIVE}</option>
          </Select>
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[150px]">
          <Input 
            label={UI_LABELS.shared.common.START_DATE} 
            type="date" 
            value={params.from ?? ""} 
            onChange={(e) => updateParams({ from: e.target.value || undefined, page: 0 })} 
            className="h-14 rounded-xl border-slate-200 bg-white" 
          />
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[150px]">
          <Input 
            label={UI_LABELS.shared.common.END_DATE} 
            type="date" 
            value={params.to ?? ""} 
            onChange={(e) => updateParams({ to: e.target.value || undefined, page: 0 })} 
            className="h-14 rounded-xl border-slate-200 bg-white" 
          />
        </div>
        <Button variant="secondary" className="w-full lg:w-auto h-14 px-grid-8 gap-grid-2 uppercase text-caption tracking-widest font-black border-slate-200 shadow-sm" onClick={() => refresh()}>
          <RefreshCcw className="h-4 w-4" />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="space-y-grid-6">
          <DataTable
            data={customers}
            columns={columns}
            loading={loading}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={handleRowClick}
            emptyState={
              <EmptyState
                title={UI_LABELS.feedback.empty.CUSTOMERS_TITLE}
                description={params.q ? UI_LABELS.feedback.empty.GENERIC_DESC : UI_LABELS.feedback.empty.CUSTOMERS_DESC}
                action={
                  <Link href="/orders?new=true">
                    <Button variant="secondary" className="h-12 px-grid-8 gap-grid-2 font-black uppercase text-caption tracking-widest border-slate-200 shadow-sm">
                      <UserPlus className="h-5 w-5" />
                      {UI_LABELS.modules.customers.REGISTER_NEW}
                    </Button>
                  </Link>
                }
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

      {/* Feature Modals */}
      <CustomerEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={selectedCustomer}
        onSuccess={() => refresh()}
      />
    </div>
  );
}
