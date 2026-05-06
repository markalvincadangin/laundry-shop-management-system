"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Users,
  Search,
  Phone,
  Plus,
  ArrowRight,
  RefreshCcw,
  Eye,
  PlusCircle,
  Settings2,
  Calendar,
  Filter,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { DataTableColumn } from "@/types/components";
import type { components } from "@/types/api.generated";

/**
 * Customers Registry Page — High Fidelity (v4.0)
 * Centralized hub for customer management. 
 * Adheres to FRONT-001 §11.3 (Data Management Pattern).
 */
export default function CustomersPage() {
  const router = useRouter();

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
        <div className="flex items-center gap-grid-3 group">
          <Avatar name={`${c.firstName} ${c.lastName}`} size="md" className="ring-2 ring-white shadow-sm transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <p className="text-body-sm font-black text-slate-900 leading-tight group-hover:text-brand-blue transition-colors">
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
          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 shadow-inner">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="font-mono tracking-tight text-[13px]">{c.contactNumber}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      sortable: true,
      sortKey: "createdAt",
      className: "hidden md:table-cell",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-body-sm text-slate-500 font-medium">
            {formatDate(c.createdAt)}
          </span>
        </div>
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
          className="shadow-sm"
        />
      ),
    },
    {
      header: UI_LABELS.shared.common.ACTIONS,
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/customers/${c.id}`} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all"
            >
              <Eye className="h-3.5 w-3.5" />
              {UI_LABELS.shared.common.DETAILS}
            </Button>
          </Link>
          <div className="w-px h-4 bg-slate-100 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all"
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
              className="h-9 w-9 p-0 text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all"
              title={UI_LABELS.forms.intake.TITLE}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-grid-8 pb-grid-20 px-4 md:px-0">
      <PageHeader
        title={UI_LABELS.layout.nav.CUSTOMERS}
        subtitle={UI_LABELS.modules.customers.SUBTITLE}
        icon={Users}
        actions={
          <Button
            className="h-13 px-grid-8 gap-grid-2 bg-brand-blue shadow-lg shadow-brand-blue/25 uppercase text-[11px] font-black tracking-widest hover:bg-brand-blue/90 active:scale-95 transition-all rounded-xl"
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
            label={UI_LABELS.shared.common.STATUS}
            value={params.isActive ?? ""}
            onChange={(e) => updateParams({ isActive: e.target.value || undefined, page: 0 })}
            className="border-slate-200 bg-white/50 h-13 rounded-xl shadow-sm"
          >
            <option value="">{UI_LABELS.shared.common.ALL_STATUSES}</option>
            <option value="true">{UI_LABELS.shared.common.ACTIVE}</option>
            <option value="false">{UI_LABELS.shared.common.INACTIVE}</option>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button 
            variant="secondary" 
            className="flex-1 lg:flex-none h-13 px-grid-6 gap-grid-2 uppercase text-[10px] tracking-widest font-black border-slate-200 bg-white shadow-sm hover:bg-slate-50 rounded-xl" 
            onClick={() => refresh()}
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
                    <Button 
                      variant="secondary" 
                      className="h-12 px-grid-8 gap-grid-2 font-black uppercase text-[10px] tracking-widest border-slate-200 shadow-sm rounded-xl"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <UserPlus className="h-5 w-5" />
                      {UI_LABELS.modules.customers.REGISTER_NEW}
                    </Button>
                  }
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
