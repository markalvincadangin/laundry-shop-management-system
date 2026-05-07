"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Calculator,
  Loader2,
  FileDown,
  BarChart3,
  Coins,
  PackageCheck
} from "lucide-react";
import { toPng } from "html-to-image";
import { pdf } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/features/shared/ReportDocument";
import { reportsService } from "@/services/reports.service";
import { paymentsService } from "@/services/payments.service";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Button,
  KPICard,
  KPICardSkeleton,
  CurrencyDisplay,
  SegmentedControl
} from "@/components/ui";
import { PageHeader, PrintHeader } from "@/components/layout";
import { SectionHeader, ErrorState, AccessDenied, LoadingState } from "@/features/shared";
const RevenueChart = dynamic(() => import("@/components/features/reports/RevenueChart").then(m => m.RevenueChart), { ssr: false });
const DetailedSalesTable = dynamic(() => import("@/components/features/reports/DetailedSalesTable").then(m => m.DetailedSalesTable), { ssr: false });
import { UI_LABELS } from "@/constants/ui";

type ChartPoint = { period: string; income: number; orders: number; rawDate: string };
type Tab = "daily" | "monthly" | "yearly";

/**
 * Reports Registry Page — High Fidelity (v5.0)
 * Forensic reporting suite for operational and financial analysis.
 * Adheres to FRONT-001 Design Standards.
 * v4.0 Consistency Pass: Premium PageHeader, consistent grid width, and refined spacing.
 */
export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("daily");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<{
    date?: string;
    period?: string;
    totalIncome: number;
    paidOrdersCount: number;
    revenueByMethod?: Record<string, number>;
  } | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyReport = useCallback(() => {
    setError(null);
    setLoading(true);
    reportsService
      .getDailySales(date)
      .then(setReport)
      .catch(() => {
        setError(UI_LABELS.feedback.error.LOAD_FAILED);
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const fetchMonthlyReport = useCallback(() => {
    setError(null);
    setLoading(true);
    reportsService
      .getMonthlySales(year, month)
      .then(setReport)
      .catch(() => {
        setError(UI_LABELS.feedback.error.LOAD_FAILED);
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const fetchYearlyReport = useCallback(() => {
    setError(null);
    setLoading(true);
    reportsService
      .getYearlySales(year)
      .then(setReport)
      .catch(() => {
        setError(UI_LABELS.feedback.error.LOAD_FAILED);
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    if (tab === "daily") fetchDailyReport();
    else if (tab === "monthly") fetchMonthlyReport();
    else fetchYearlyReport();
  }, [tab, fetchDailyReport, fetchMonthlyReport, fetchYearlyReport]);

  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 6);

      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];

      const data = await reportsService.getSalesTrend(fromStr, toStr);

      // Map to chart points, ensuring all 7 days are represented even if zero
      const points: ChartPoint[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(from);
        d.setDate(from.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const dayData = data.find(item => item.date === dStr);

        points.push({
          period: d.toLocaleString("en-US", { weekday: "short", day: "numeric" }),
          income: dayData?.totalIncome ?? 0,
          orders: dayData?.paidOrdersCount ?? 0,
          rawDate: dStr
        });
      }
      setChartData(points);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const avgOrderValue = report && report.paidOrdersCount > 0
    ? report.totalIncome / report.paidOrdersCount
    : 0;

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!report || isExporting) return;
    
    setIsExporting(true);
    try {
      // 1. Capture the chart as an image
      const chartElement = document.getElementById("revenue-chart");
      let chartImage = "";
      if (chartElement) {
        // Wait a bit to ensure animations are finished or capture state
        chartImage = await toPng(chartElement, { 
          quality: 0.95, 
          backgroundColor: "#fff",
          pixelRatio: 2 // High quality
        });
      }

      // 1.5 Fetch transactions for the period
      const transactionResponse = await paymentsService.list({
        from: tab === 'daily' ? date : tab === 'monthly' ? `${year}-${month}-01` : `${year}-01-01`,
        to: tab === 'daily' ? date : tab === 'monthly' ? `${year}-${month}-31` : `${year}-12-31`,
        size: 50,
        sortBy: "paymentDate",
        sortDir: "desc"
      });

      // 2. Prepare data for the PDF
      const pdfData = {
        title: `SALES PERFORMANCE — ${tab.toUpperCase()}`,
        period: tab === 'daily' ? date : tab === 'monthly' ? `${year}-${month}` : year,
        kpis: [
          { label: "Total Revenue", value: `PHP ${report.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, subtitle: "Settled Payments" },
          { label: "Paid Orders", value: report.paidOrdersCount.toString(), subtitle: "Completed Sales" },
          { label: "Average Sale", value: `PHP ${avgOrderValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, subtitle: "Per Transaction" }
        ],
        charts: chartImage ? [chartImage] : [],
        table: {
          columns: [
            { header: "Reference", width: "25%", isMono: true },
            { header: "Customer", width: "25%", isBold: true },
            { header: "Method", width: "20%" },
            { header: "Amount", width: "15%", align: "right", isBold: true },
            { header: "Status", width: "15%", align: "right" }
          ],
          rows: transactionResponse.content.slice(0, 20).map(t => [
            t.orderReferenceNumber,
            t.customerName || "Walk-in",
            t.paymentMethod,
            `PHP ${t.amountPaid.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            "PAID"
          ])
        }
      };

      // 3. Generate the PDF blob
      const doc = <ReportDocument data={pdfData as any} />;
      const blob = await pdf(doc).toBlob();
      
      // 4. Download the blob
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Faith_Laundry_Report_${String(pdfData.period).replace(/-/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading) {
    return <LoadingState fullPage />;
  }

  if (user?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
      <PrintHeader 
        module="Sales Performance Report" 
        period={`${tab.toUpperCase()} — ${tab === 'daily' ? date : tab === 'monthly' ? `${year}-${month}` : year}`} 
      />

      <div className="no-print">
        <PageHeader
          variant="premium"
          title={UI_LABELS.layout.nav.REPORTS}
          subtitle={UI_LABELS.modules.reports.SUBTITLE}
          icon={BarChart3}
          actions={
            <div className="flex items-center gap-grid-4">
              <Button 
                variant="outline" 
                className="h-14 px-grid-6 gap-grid-3 text-caption font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-300 group/export disabled:opacity-50 rounded-2xl" 
                onClick={handleExportPDF}
                disabled={isExporting || loading}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 transition-transform group-hover/export:-translate-y-0.5" />
                )}
                {isExporting ? "Generating PDF..." : UI_LABELS.shared.buttons.EXPORT_PDF}
              </Button>
              <SegmentedControl
                options={[
                  { label: UI_LABELS.modules.reports.DAILY, value: "daily" },
                  { label: UI_LABELS.modules.reports.MONTHLY, value: "monthly" },
                  { label: UI_LABELS.modules.reports.YEARLY, value: "yearly" }
                ]}
                value={tab}
                onChange={(v: string) => setTab(v as Tab)}
              />
            </div>
          }
        />
      </div>

      {error ? (
        <ErrorState
          error={error}
          reset={() => tab === "daily" ? fetchDailyReport() : tab === "monthly" ? fetchMonthlyReport() : fetchYearlyReport()}
        />
      ) : (
        <div className="space-y-grid-16">
          {/* Key Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-grid-6 kpi-grid-print"
          >
            {loading ? (
              <>
                <KPICardSkeleton />
                <KPICardSkeleton />
                <KPICardSkeleton />
              </>
            ) : (
              <>
                <KPICard title={UI_LABELS.modules.reports.TOTAL_REVENUE} value={<div className="font-black"><CurrencyDisplay amount={report?.totalIncome ?? 0} size="xl" /></div>} subtitle={UI_LABELS.modules.reports.PROCESSED_PAYMENTS} icon={Coins} variant="accent" />
                <KPICard title={UI_LABELS.modules.reports.PAID_ORDERS} value={report?.paidOrdersCount ?? 0} subtitle={UI_LABELS.modules.reports.COMPLETED_TRANS} icon={PackageCheck} variant="success" />
                <KPICard title={UI_LABELS.modules.reports.AVG_SALE} value={<div className="font-black"><CurrencyDisplay amount={avgOrderValue} size="xl" /></div>} subtitle={UI_LABELS.modules.reports.PER_ORDER_REV} icon={Calculator} variant="default" />
              </>
            )}
          </motion.div>

          {/* Forensic Breakdown by Method (Daily only) */}
          {tab === "daily" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-grid-4"
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                ))
              ) : report?.revenueByMethod && Object.keys(report.revenueByMethod).length > 0 ? (
                Object.entries(report.revenueByMethod).map(([method, amount]) => (
                  <div key={method} className="bg-white/40 backdrop-blur-md border border-slate-200/60 rounded-2xl p-grid-6 flex flex-col gap-2 shadow-sm hover:border-brand-blue/30 transition-all group">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-brand-blue transition-colors">
                      {method.replace(/_/g, ' ')}
                    </p>
                    <div className="font-bold">
                       <CurrencyDisplay amount={amount} size="md" />
                    </div>
                  </div>
                ))
              ) : null}
            </motion.div>
          )}

          {/* Selection & Chart Section */}
          <div className="grid lg:grid-cols-12 gap-grid-8 items-start">
            <div className="lg:col-span-4 space-y-grid-6 no-print">
              <Card variant="glass" className="bg-white/40 border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden rounded-[2.5rem]">
                <CardHeader className="border-b border-slate-200/40 bg-white/70 backdrop-blur-md px-grid-8 py-grid-6">
                  <CardTitle className="text-slate-900 text-[12px] font-black uppercase tracking-[0.2em]">
                    {UI_LABELS.modules.reports.PERIOD_SELECTION}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-grid-8 space-y-grid-8">
                  {tab === "daily" && (
                    <Input
                      label={UI_LABELS.modules.reports.SELECT_DATE}
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-slate-200 bg-white h-14 rounded-xl"
                    />
                  )}
                  {tab === "monthly" && (
                    <div className="grid gap-grid-6">
                      <Select
                        label={UI_LABELS.modules.reports.MONTH}
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                        className="border-slate-200 bg-white h-14 rounded-xl"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label={UI_LABELS.modules.reports.YEAR}
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value, 10))}
                        className="border-slate-200 bg-white h-14 rounded-xl"
                      />
                    </div>
                  )}
                  {tab === "yearly" && (
                    <Input
                      label={UI_LABELS.modules.reports.YEAR}
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value, 10))}
                      className="border-slate-200 bg-white h-14 rounded-xl"
                    />
                  )}
                  <div className="flex items-start gap-grid-4 p-grid-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 shadow-sm relative overflow-hidden group/info">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full -mr-12 -mt-12 group-hover/info:scale-110 transition-transform duration-700" />
                    <div className="h-10 w-10 shrink-0 bg-white rounded-xl shadow-sm border border-brand-blue/10 flex items-center justify-center relative z-10">
                      <BarChart3 className="h-5 w-5 text-brand-blue" />
                    </div>
                    <p className="text-body-sm text-slate-600 font-medium leading-relaxed italic relative z-10">
                      {UI_LABELS.modules.reports.INFO_TEXT}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8 chart-container-print">
              <RevenueChart 
                data={chartData} 
                loading={chartLoading} 
                onPointClick={(point) => {
                  if (point.rawDate) {
                    setDate(point.rawDate);
                    setTab("daily");
                    document.getElementById("sales-history-section")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              />
            </div>
          </div>

          {/* Sales History */}
          <div id="sales-history-section" className="space-y-grid-8 pt-grid-12 border-t border-slate-200/60">
            <div className="px-1">
               <SectionHeader title={UI_LABELS.modules.reports.SALES_HISTORY} className="mb-6" />
            </div>
            {tab === "daily" && (
              <DetailedSalesTable date={date} />
            )}
            {tab === "monthly" && (
              <DetailedSalesTable
                from={`${year}-${String(month).padStart(2, '0')}-01`}
                to={`${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`}
                label={`Detailed breakdown for ${new Date(year, month - 1).toLocaleString("default", { month: "long" })} ${year}`}
              />
            )}
            {tab === "yearly" && (
              <DetailedSalesTable
                from={`${year}-01-01`}
                to={`${year}-12-31`}
                label={`Detailed breakdown for Full Year ${year}`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
