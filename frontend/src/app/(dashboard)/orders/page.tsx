"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag,
  Activity,
  CheckCircle,
  CreditCard,
  Plus,
  ArrowUpRight,
  User,
  Package,
  ClipboardList,
  Search,
  RefreshCcw,
  Loader2,
  FileDown
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/features/shared/ReportDocument";
import { UI_LABELS } from "@/constants/ui";
import { useOrders } from "@/hooks/useOrders";
import { useRegistry } from "@/hooks/useRegistry";
import { 
  StatusBadge, 
  PaymentStatusBadge,
  KPICard, 
  Button, 
  Input,
  Select 
} from "@/components/ui";
import { DataTable, FilterBar, Pagination, EmptyState, ErrorState } from "@/features/shared";
import { PageHeader, PrintHeader } from "@/components/layout";
import { formatWeight } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTableColumn } from "@/types/components";

/**
 * OrdersPage
 * Central registry for managing laundry orders.
 * Aligned with FRONT-001 HCI standards for touch targets and high-density layouts.
 */
export default function OrdersPage() {
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
    defaultSortBy: "createdAt",
    defaultSortDir: "desc",
    defaultPageSize: 10
  });

  const { 
    orders, 
    stats, 
    loading, 
    error,
    pagination, 
    refresh 
  } = useOrders(params as any);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (isExporting || orders.length === 0) return;
    
    setIsExporting(true);
    try {
      const pdfData = {
        title: "ORDER MANAGEMENT REGISTRY",
        period: params.from && params.to 
          ? `${params.from} to ${params.to}`
          : params.from || params.to || "All Active Orders",
        kpis: [
          { 
            label: "Total Orders", 
            value: pagination.totalElements.toString(), 
            subtitle: "Registry Total" 
          },
          { 
            label: "Ready for Pickup", 
            value: (stats?.readyForPickup || 0).toString(), 
            subtitle: "Awaiting Customer" 
          },
          { 
            label: "In Progress", 
            value: (stats?.inProgress || 0).toString(), 
            subtitle: "Active Operations" 
          }
        ],
        table: {
          columns: [
            { header: "Reference", width: "20%", isMono: true },
            { header: "Customer", width: "25%", isBold: true },
            { header: "Status", width: "20%" },
            { header: "Loads", width: "15%", align: "right" },
            { header: "Total", width: "20%", align: "right", isBold: true }
          ],
          rows: orders.map(o => [
            o.referenceNumber,
            o.customerName || "N/A",
            o.currentStatus,
            o.totalLoads.toString(),
            `PHP ${o.grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ])
        }
      };

      const doc = <ReportDocument data={pdfData as any} />;
      const blob = await pdf(doc).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Faith_Laundry_Orders_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Orders export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const columns: DataTableColumn<any>[] = [
    {
      header: UI_LABELS.shared.common.ORDER_NUMBER,
      sortable: true,
      sortKey: "referenceNumber",
      render: (order) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors font-mono tracking-wider">
              {order.referenceNumber}
            </span>
            {(order.serviceName?.includes("Rush") || order.serviceRateId === 2) && (
              <StatusBadge label="RUSH" variant="rush" className="px-1.5 py-0.5 text-[8px]" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
             <User className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[140px]">
                {order.customerName || UI_LABELS.shared.common.NAME}
              </span>
          </div>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.DETAILS,
      render: (order) => (
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 opacity-60" /> {order.totalLoads} {UI_LABELS.shared.units.LOADS}</span>
          <span className="flex items-center gap-1.5 tabular-nums"><Activity className="h-3.5 w-3.5 opacity-60" /> {formatWeight(order.weightKg)}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      sortable: true,
      sortKey: "currentStatus",
      render: (order) => <StatusBadge status={order.currentStatus ?? ""} />,
    },
    {
      header: UI_LABELS.layout.nav.PAYMENTS,
      sortable: true,
      sortKey: "paymentStatus",
      render: (order) => <PaymentStatusBadge status={order.paymentStatus ?? ""} />,
    },
    {
      header: UI_LABELS.shared.common.TOTAL,
      sortable: true,
      sortKey: "grandTotal",
      align: "right",
      render: (order) => (
        <div className="flex items-center justify-end gap-1.5 group-hover:text-brand-blue transition-colors">
          <CurrencyDisplay amount={order.grandTotal} size="md" numberClassName="font-black text-slate-900" />
          <ArrowUpRight className="h-3.5 w-3.5 opacity-20 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <PrintHeader module="Order Management Registry" />

      <div className="no-print">
        <PageHeader 
          title={UI_LABELS.layout.nav.ORDERS}
          subtitle={UI_LABELS.modules.orders.SUBTITLE}
          icon={ClipboardList}
          actions={
            <div className="flex items-center gap-4 no-print">
              <Button 
                variant="outline" 
                className="h-14 px-8 gap-3 text-caption font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-300 group/export disabled:opacity-50 rounded-2xl" 
                onClick={handleExportPDF}
                disabled={isExporting || loading}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 transition-transform group-hover/export:-translate-y-0.5" />
                )}
                {isExporting ? "Exporting..." : "Export Registry"}
              </Button>
              <Button 
                variant="primary" 
                className="h-14 px-8 gap-2 bg-brand-blue hover:bg-brand-blue/90 hover:shadow-2xl hover:shadow-brand-blue/20 text-white transition-all duration-300 uppercase text-caption tracking-widest font-black rounded-2xl group/cta"
                onClick={() => router.push("/orders/new")}
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                {UI_LABELS.modules.orders.CREATE_TITLE || "New Order"}
              </Button>
            </div>
          }
        />
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 kpi-grid-print">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="kpi-card-print">
            <KPICard title={UI_LABELS.modules.dashboard.KPI_TODAYS_ORDERS} value={stats.todaysOrders} subtitle={UI_LABELS.modules.dashboard.CREATED_TODAY} icon={ShoppingBag} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="kpi-card-print">
            <KPICard title={UI_LABELS.modules.dashboard.KPI_ACTIVE_LOADS} value={stats.inProgress} subtitle={UI_LABELS.modules.dashboard.CURR_PROCESSING} variant="accent" icon={Activity} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="kpi-card-print">
            <KPICard title={UI_LABELS.modules.dashboard.KPI_READY_PICKUP} value={stats.readyForPickup} subtitle={UI_LABELS.modules.dashboard.WAITING_CUST} variant="success" icon={CheckCircle} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="kpi-card-print">
            <KPICard title={UI_LABELS.modules.dashboard.AWAITING_PAYMENT} value={stats.unpaidOrders} subtitle={UI_LABELS.shared.status.UNPAID} variant="warning" icon={CreditCard} />
          </motion.div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="no-print">
        <FilterBar title={UI_LABELS.shared.common.FILTER}>
          <div className="flex-[2] min-w-[240px]">
            <Input
              placeholder={UI_LABELS.shared.common.SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4 text-brand-blue" />}
              className="h-14 rounded-xl border-slate-200 bg-white"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <Select
              label={UI_LABELS.shared.common.STATUS}
              value={params.status ?? ""}
              onChange={(e) => updateParams({ status: e.target.value || undefined })}
              className="border-slate-200 bg-white"
            >
              <option value="">{UI_LABELS.shared.common.ALL_STATUSES}</option>
              <option value="RECEIVED">{UI_LABELS.shared.status.RECEIVED}</option>
              <option value="WASHING">{UI_LABELS.shared.status.WASHING}</option>
              <option value="DRYING">{UI_LABELS.shared.status.DRYING}</option>
              <option value="FOLDING">{UI_LABELS.shared.status.FOLDING}</option>
              <option value="READY_FOR_PICKUP">{UI_LABELS.shared.status.READY_FOR_PICKUP}</option>
              <option value="RELEASED">{UI_LABELS.shared.status.RELEASED}</option>
              <option value="CANCELLED">{UI_LABELS.shared.status.CANCELLED}</option>
            </Select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Select
              label={UI_LABELS.layout.nav.PAYMENTS}
              value={params.paymentStatus ?? ""}
              onChange={(e) => updateParams({ paymentStatus: e.target.value || undefined })}
              className="border-slate-200 bg-white"
            >
              <option value="">{UI_LABELS.shared.common.ALL_PAYMENTS}</option>
              <option value="UNPAID">{UI_LABELS.shared.status.UNPAID}</option>
              <option value="PAID">{UI_LABELS.shared.status.PAID}</option>
            </Select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Input label={UI_LABELS.shared.common.START_DATE} type="date" value={params.from ?? ""} onChange={(e) => updateParams({ from: e.target.value || undefined })} className="border-slate-200 bg-white" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <Input label={UI_LABELS.shared.common.END_DATE} type="date" value={params.to ?? ""} onChange={(e) => updateParams({ to: e.target.value || undefined })} className="border-slate-200 bg-white" />
          </div>
          <Button variant="secondary" className="h-14 px-8 gap-2 uppercase text-caption tracking-widest font-black shadow-sm border-slate-200" onClick={() => refresh()}>
            <RefreshCcw className="h-4 w-4" />
            {UI_LABELS.shared.common.REFRESH}
          </Button>
        </FilterBar>
      </div>

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="space-y-6">
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={(order) => router.push(`/orders/${order.id}`)}
          emptyState={
            <EmptyState
              title={UI_LABELS.feedback.empty.ORDERS_TITLE}
              description={UI_LABELS.feedback.empty.ORDERS_DESC}
            />
          }
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
    </div>
  );
}


