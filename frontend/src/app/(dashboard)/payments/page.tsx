"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Search, 
  RefreshCcw,
  Loader2,
  FileDown,
  Wallet,
  Hash,
  Database,
  History
} from "lucide-react";
import { motion } from "framer-motion";
import { pdf } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/features/shared/ReportDocument";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments } from "@/hooks/usePayments";
import { useRegistry } from "@/hooks/useRegistry";
import { PaymentResponse } from "@/services/payments.service";
import { Button, Input, KPICard, CurrencyDisplay } from "@/components/ui";
import { FilterBar, Pagination, AccessDenied, EmptyState, ErrorState, LoadingState } from "@/features/shared";
import { PageHeader, PrintHeader } from "@/components/layout";
import { PaymentLedgerTable, PaymentDetailsModal } from "@/features/payments";
import { UI_LABELS } from "@/constants/ui";

/**
 * Payments Page (Financial Registry) — High Fidelity (v5.0)
 * Standardized with URL sync, sorting, and server-side filtering.
 * v4.0 Consistency Pass: Premium PageHeader, consistent grid width, and refined spacing.
 */
export default function PaymentsPage() {
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

  // Calculated Metrics for the current view
  const currentViewTotal = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
      <PrintHeader module="Financial Transaction Ledger" />

      <div className="no-print">
        <PageHeader 
          variant="premium"
          title={UI_LABELS.layout.nav.PAYMENTS}
          subtitle={UI_LABELS.modules.payments.SUBTITLE}
          icon={CreditCard}
          actions={
            <div className="no-print">
              <Button 
                variant="outline" 
                className="h-14 px-grid-8 gap-grid-3 text-caption font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-300 group/export disabled:opacity-50 rounded-2xl" 
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

      {/* Snapshot KPIs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-grid-6 kpi-grid-print no-print"
      >
        <KPICard 
          title="Session Revenue" 
          value={<div className="font-black"><CurrencyDisplay amount={currentViewTotal} size="xl" /></div>} 
          subtitle="Revenue in current view" 
          icon={Wallet} 
          variant="accent" 
        />
        <KPICard 
          title="Record Count" 
          value={pagination.totalElements} 
          subtitle="Total transactions found" 
          icon={Hash} 
          variant="default" 
        />
        <KPICard 
          title="Active Load" 
          value={payments.length} 
          subtitle="Showing on this page" 
          icon={Database} 
          variant="success" 
        />
      </motion.div>

      <div className="no-print">
        <FilterBar title={UI_LABELS.shared.common.FILTER}>
          <div className="w-full lg:flex-[2] lg:min-w-[240px]">
            <Input
              placeholder={UI_LABELS.modules.payments.SEARCH_PAYMENTS}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4 text-brand-blue" />}
              className="h-14 rounded-xl border-slate-200 bg-white shadow-sm"
            />
          </div>
          <div className="w-full lg:flex-1 lg:min-w-[180px]">
            <Input 
              label={UI_LABELS.shared.common.START_DATE} 
              type="date" 
              value={params.from ?? ""} 
              onChange={(e) => updateParams({ from: e.target.value || undefined, page: 0 })} 
              className="border-slate-200 bg-white h-14 rounded-xl shadow-sm" 
            />
          </div>
          <div className="w-full lg:flex-1 lg:min-w-[180px]">
            <Input 
              label={UI_LABELS.shared.common.END_DATE} 
              type="date" 
              value={params.to ?? ""} 
              onChange={(e) => updateParams({ to: e.target.value || undefined, page: 0 })} 
              className="border-slate-200 bg-white h-14 rounded-xl shadow-sm" 
            />
          </div>
          <Button variant="secondary" className="w-full lg:w-auto h-14 px-grid-8 gap-grid-2 border-slate-200 shadow-sm font-black uppercase text-caption tracking-widest rounded-xl" onClick={() => refresh()}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {UI_LABELS.shared.common.REFRESH}
          </Button>
        </FilterBar>
      </div>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-grid-6"
        >
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
        </motion.div>
      )}

      <PaymentDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
}
