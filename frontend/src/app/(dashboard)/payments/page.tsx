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
  RefreshCcw,
  Loader2,
  FileDown
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/features/shared/ReportDocument";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments } from "@/hooks/usePayments";
import { useRegistry } from "@/hooks/useRegistry";
import { PaymentResponse } from "@/services/payments.service";
import { Button, Input, KPICard } from "@/components/ui";
import { DataTable, FilterBar, Pagination, AccessDenied, EmptyState, ErrorState, LoadingState } from "@/features/shared";
import { PageHeader, PrintHeader } from "@/components/layout";
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
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (isExporting || payments.length === 0) return;
    
    setIsExporting(true);
    try {
      const totalAmount = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      
      const pdfData = {
        title: "FINANCIAL TRANSACTION LEDGER",
        period: params.from && params.to 
          ? `${params.from} to ${params.to}`
          : params.from || params.to || "All Time",
        kpis: [
          { 
            label: "Total Collected", 
            value: `PHP ${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 
            subtitle: "Aggregated Revenue" 
          },
          { 
            label: "Transaction Count", 
            value: pagination.totalElements.toString(), 
            subtitle: "Processed Payments" 
          },
          { 
            label: "Average Payment", 
            value: `PHP ${(totalAmount / (payments.length || 1)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 
            subtitle: "Per Customer" 
          }
        ],
        table: {
          columns: [
            { header: "Reference", width: "25%", isMono: true },
            { header: "Customer", width: "25%", isBold: true },
            { header: "Method", width: "20%" },
            { header: "Amount", width: "15%", align: "right", isBold: true },
            { header: "Status", width: "15%", align: "right" }
          ],
          rows: payments.map(p => [
            p.orderReferenceNumber,
            p.customerName || "Walk-in",
            p.paymentMethod,
            `PHP ${p.amountPaid.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            "PAID"
          ])
        }
      };

      const doc = <ReportDocument data={pdfData as any} />;
      const blob = await pdf(doc).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Faith_Laundry_Ledger_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Ledger export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

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
      <PrintHeader module="Financial Transaction Ledger" />

      <div className="no-print">
        <PageHeader 
          title={UI_LABELS.layout.nav.PAYMENTS}
          subtitle={UI_LABELS.modules.payments.SUBTITLE}
          icon={CreditCard}
          actions={
            <div className="no-print">
              <Button 
                variant="outline" 
                className="h-12 px-grid-6 gap-grid-2 text-caption font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-300 group/export disabled:opacity-50" 
                onClick={handleExportPDF}
                disabled={isExporting || loading}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 transition-transform group-hover/export:-translate-y-0.5" />
                )}
                {isExporting ? "Exporting..." : UI_LABELS.modules.payments.EXPORT}
              </Button>
            </div>
          }
        />
      </div>

      <div className="no-print">
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
      </div>

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

          <div className="no-print">
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
