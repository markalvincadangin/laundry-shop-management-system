"use client";

import { useCallback, useEffect, useState } from "react";
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
  SegmentedControl 
} from "@/components/ui";
import { PageHeader } from "@/components/layout";
import { SectionHeader, ErrorState, AccessDenied, LoadingState } from "@/features/shared";
import { RevenueChart, DetailedSalesTable } from "@/components/features/reports";
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
    const now = new Date();
    try {
      const promises = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        return reportsService.getDailySales(dateStr).then((res) => ({
          period: d.toLocaleString("en-US", { weekday: "short", day: "numeric" }),
          income: res.totalIncome,
          orders: res.paidOrdersCount,
          rawDate: dateStr
        }));
      });
      const points = await Promise.all(promises);
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
          <SegmentedControl 
            options={[
              { label: UI_LABELS.modules.reports.DAILY, value: "daily" },
              { label: UI_LABELS.modules.reports.MONTHLY, value: "monthly" },
              { label: UI_LABELS.modules.reports.YEARLY, value: "yearly" }
            ]}
            value={tab}
            onChange={(v: string) => setTab(v as Tab)}
          />
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
            <KPICard 
              title={UI_LABELS.modules.reports.TOTAL_REVENUE} 
              value={formatCurrency(report?.totalIncome ?? 0)} 
              subtitle={UI_LABELS.modules.reports.PROCESSED_PAYMENTS}
              icon={DollarSign}
              variant="accent"
            />
            <KPICard 
              title={UI_LABELS.modules.reports.PAID_ORDERS} 
              value={report?.paidOrdersCount ?? 0} 
              subtitle={UI_LABELS.modules.reports.COMPLETED_TRANS}
              icon={ClipboardCheck}
              variant="success"
            />
            <KPICard 
              title={UI_LABELS.modules.reports.AVG_SALE} 
              value={formatCurrency(avgOrderValue)} 
              subtitle={UI_LABELS.modules.reports.PER_ORDER_REV}
              icon={PercentCircle}
              variant="default"
            />
          </div>

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
                  <div className="flex items-start gap-3 p-5 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 shadow-inner">
                    <Info className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
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
