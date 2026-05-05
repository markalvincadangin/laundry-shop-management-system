"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Info,
  DollarSign,
  ClipboardCheck,
  PercentCircle
} from "lucide-react";
import { reportsService } from "@/services/reports.service";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  KPICard,
  KPICardSkeleton,
  CurrencyDisplay,
  SegmentedControl
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { SectionHeader, ErrorState, AccessDenied, LoadingState } from "@/features/shared";
const RevenueChart = dynamic(() => import("@/components/features/reports/RevenueChart").then(m => m.RevenueChart), { ssr: false });
const DetailedSalesTable = dynamic(() => import("@/components/features/reports/DetailedSalesTable").then(m => m.DetailedSalesTable), { ssr: false });
import { UI_LABELS } from "@/constants/ui";
import { formatDate, formatCurrency } from "@/lib/utils";

type ChartPoint = { period: string; income: number; orders: number; rawDate: string };
type Tab = "daily" | "monthly" | "yearly";

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

  if (authLoading) {
    return <LoadingState fullPage />;
  }

  if (user?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <PageHeader
        title={UI_LABELS.layout.nav.REPORTS}
        subtitle={UI_LABELS.modules.reports.SUBTITLE}
        icon={TrendingUp}
        actions={
<<<<<<< Updated upstream
          <SegmentedControl 
            options={[
              { label: UI_LABELS.modules.reports.DAILY, value: "daily" },
              { label: UI_LABELS.modules.reports.MONTHLY, value: "monthly" },
              { label: UI_LABELS.modules.reports.YEARLY, value: "yearly" }
            ]}
            value={tab}
            onChange={(v: string) => setTab(v as Tab)}
          />
=======
          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-12 px-6 gap-2 text-caption font-black uppercase tracking-widest border-slate-200" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              {UI_LABELS.modules.reports.EXPORT_PDF}
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
>>>>>>> Stashed changes
        }
      />

      {error ? (
        <ErrorState
          error={error}
          reset={() => tab === "daily" ? fetchDailyReport() : tab === "monthly" ? fetchMonthlyReport() : fetchYearlyReport()}
        />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <>
                <KPICardSkeleton />
                <KPICardSkeleton />
                <KPICardSkeleton />
              </>
            ) : (
              <>
                <KPICard title={UI_LABELS.modules.reports.TOTAL_REVENUE} value={<CurrencyDisplay amount={report?.totalIncome ?? 0} size="xl" />} subtitle={UI_LABELS.modules.reports.PROCESSED_PAYMENTS} icon={DollarSign} variant="accent" />
                <KPICard title={UI_LABELS.modules.reports.PAID_ORDERS} value={report?.paidOrdersCount ?? 0} subtitle={UI_LABELS.modules.reports.COMPLETED_TRANS} icon={ClipboardCheck} variant="success" />
                <KPICard title={UI_LABELS.modules.reports.AVG_SALE} value={<CurrencyDisplay amount={avgOrderValue} size="xl" />} subtitle={UI_LABELS.modules.reports.PER_ORDER_REV} icon={PercentCircle} variant="default" />
              </>
            )}
          </div>

          {/* Forensic Breakdown by Method (Daily only) */}
          {tab === "daily" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                ))
              ) : report?.revenueByMethod && Object.keys(report.revenueByMethod).length > 0 ? (
                Object.entries(report.revenueByMethod).map(([method, amount]) => (
                  <div key={method} className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:border-brand-blue/30 transition-all group">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-blue transition-colors">
                      {method.replace(/_/g, ' ')}
                    </p>
                    <CurrencyDisplay amount={amount} size="md" className="text-slate-900 font-bold" />
                  </div>
                ))
              ) : null}
            </motion.div>
          )}

          {/* Selection & Chart Section */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-slate-900 text-sm font-extrabold uppercase tracking-widest">
                    {UI_LABELS.modules.reports.PERIOD_SELECTION}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {tab === "daily" && (
                    <Input
                      label={UI_LABELS.modules.reports.SELECT_DATE}
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-slate-200 bg-white h-14"
                    />
                  )}
                  {tab === "monthly" && (
                    <div className="grid gap-6">
                      <Select
                        label={UI_LABELS.modules.reports.MONTH}
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                        className="border-slate-200 bg-white"
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
                        className="border-slate-200 bg-white h-14"
                      />
                    </div>
                  )}
                  {tab === "yearly" && (
                    <Input
                      label={UI_LABELS.modules.reports.YEAR}
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value, 10))}
                      className="border-slate-200 bg-white h-14"
                    />
                  )}
                  <div className="flex items-start gap-4 p-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 shadow-sm relative overflow-hidden group/info">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full -mr-12 -mt-12 group-hover/info:scale-110 transition-transform duration-700" />
                    <Info className="h-5 w-5 text-brand-blue shrink-0 mt-1 relative z-10" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic relative z-10">
                      {UI_LABELS.modules.reports.INFO_TEXT}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <RevenueChart data={chartData} loading={chartLoading} />
            </div>
          </div>
        </>
      )}

      {/* Sales History */}
      <div className="space-y-6">
        <SectionHeader title={UI_LABELS.modules.reports.SALES_HISTORY} className="mb-6" />
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
  );
}
