"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  User, 
  Search, 
  Download,
  RefreshCcw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments } from "@/hooks/usePayments";
import { useRegistry } from "@/hooks/useRegistry";
import { PaymentResponse } from "@/services/payments.service";
import { Button, Input, KPICard } from "@/components/ui";
import { DataTable, FilterBar, Pagination, AccessDenied, EmptyState, ErrorState, LoadingState } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { PaymentLedgerTable, PaymentActionModal, PaymentDetailsModal } from "@/features/payments";
import { UI_LABELS } from "@/constants/ui";
import { DataTableColumn } from "@/types/components";

/**
 * Payments Page (Financial Registry)
 * Standardized with URL sync, sorting, and server-side filtering.
 */
export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
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
    defaultSortBy: "paymentDate",
    defaultSortDir: "desc",
    defaultPageSize: 15,
    searchParamKey: "orderId"
  });

  const { 
    payments,
    loading,
    error,
    pagination, 
    refresh 
  } = usePayments(params as any);

  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (payment: PaymentResponse) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  if (authLoading) {
    return <LoadingState fullPage />;
  }

  if (user?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
      <PageHeader 
        title={UI_LABELS.layout.nav.PAYMENTS}
        subtitle={UI_LABELS.modules.payments.SUBTITLE}
        icon={CreditCard}
        actions={
          <Button variant="outline" className="h-12 px-grid-6 gap-grid-2 text-caption font-black uppercase tracking-widest border-slate-200" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            {UI_LABELS.modules.payments.EXPORT}
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
          <Input 
            label={UI_LABELS.shared.common.START_DATE} 
            type="date" 
            value={params.from ?? ""} 
            onChange={(e) => updateParams({ from: e.target.value || undefined, page: 0 })} 
            className="border-slate-200 bg-white h-14" 
          />
        </div>
        <div className="w-full lg:flex-1 lg:min-w-[180px]">
          <Input 
            label={UI_LABELS.shared.common.END_DATE} 
            type="date" 
            value={params.to ?? ""} 
            onChange={(e) => updateParams({ to: e.target.value || undefined, page: 0 })} 
            className="border-slate-200 bg-white h-14" 
          />
        </div>
        <Button variant="secondary" className="w-full lg:w-auto h-14 px-grid-8 gap-grid-2 border-slate-200 shadow-sm font-black uppercase text-caption tracking-widest" onClick={() => refresh()}>
          <RefreshCcw className="h-4 w-4" />
          {UI_LABELS.shared.common.REFRESH}
        </Button>
      </FilterBar>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="space-y-grid-6">
          <PaymentLedgerTable
            payments={payments}
            loading={loading}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={handleRowClick}
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

      <PaymentDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
}
