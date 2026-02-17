"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ApiError } from "@/lib/api/client";
import { reportsApi } from "@/lib/api/reports";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type ChartPoint = { period: string; income: number; orders: number };

type Tab = "daily" | "monthly" | "yearly";

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const [date, setDate] = useState(() => formatDate(new Date()));
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
    reportsApi
      .getDailySales(date)
      .then(setReport)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load report");
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const fetchMonthlyReport = useCallback(() => {
    setError(null);
    setLoading(true);
    reportsApi
      .getMonthlySales(year, month)
      .then(setReport)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load report");
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const fetchYearlyReport = useCallback(() => {
    setError(null);
    setLoading(true);
    reportsApi
      .getYearlySales(year)
      .then(setReport)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load report");
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
        const dateStr = formatDate(d);
        return reportsApi.getDailySales(dateStr).then((res) => ({
          period: dateStr,
          income: res.totalIncome,
          orders: res.paidOrdersCount,
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

  const reportPeriod = report?.date ?? report?.period ?? null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary">
        Sales Reports
      </h1>
      <p className="mb-6 text-sm text-neutral-text-secondary">
        View aggregated income from paid orders.
      </p>

      <div className="mb-6 flex gap-2 border-b border-neutral-border">
        <button
          type="button"
          onClick={() => setTab("daily")}
          className={`border-b-2 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            tab === "daily"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-neutral-text-secondary hover:text-neutral-text-primary"
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => setTab("monthly")}
          className={`border-b-2 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            tab === "monthly"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-neutral-text-secondary hover:text-neutral-text-primary"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setTab("yearly")}
          className={`border-b-2 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            tab === "yearly"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-neutral-text-secondary hover:text-neutral-text-primary"
          }`}
        >
          Yearly
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        {tab === "daily" && (
          <div>
            <label htmlFor="report-date" className="mb-1 block text-sm font-medium text-neutral-text-secondary">
              Date
            </label>
            <input
              id="report-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-neutral-border px-3 py-2"
            />
          </div>
        )}
        {tab === "monthly" && (
          <>
            <div>
              <label htmlFor="report-month" className="mb-1 block text-sm font-medium text-neutral-text-secondary">
                Month
              </label>
              <select
                id="report-month"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="rounded-lg border border-neutral-border px-3 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="report-year-m" className="mb-1 block text-sm font-medium text-neutral-text-secondary">
                Year
              </label>
              <input
                id="report-year-m"
                type="number"
                min={2020}
                max={2030}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-24 rounded-lg border border-neutral-border px-3 py-2"
              />
            </div>
          </>
        )}
        {tab === "yearly" && (
          <div>
            <label htmlFor="report-year" className="mb-1 block text-sm font-medium text-neutral-text-secondary">
              Year
            </label>
            <input
              id="report-year"
              type="number"
              min={2020}
              max={2030}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-24 rounded-lg border border-neutral-border px-3 py-2"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {tab === "daily" && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-neutral-text-primary">
            Last 7 Days — Sales Trend
          </h2>
          {chartLoading ? (
            <ChartSkeleton />
          ) : chartData.length > 0 ? (
            <div className="h-64 rounded-lg border border-neutral-border bg-white p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value != null ? [`₱${value.toFixed(2)}`, "Income"] : ["—", "Income"]
                    }
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Bar dataKey="income" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Income" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No completed orders in this period"
              description="No sales data for the last 7 days."
            />
          )}
        </div>
      )}

      {loading && !report ? (
        <CardSkeleton />
      ) : report ? (
        <div className="rounded-lg border border-neutral-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-neutral-text-primary">
            {reportPeriod}
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-neutral-text-secondary">Total income</dt>
              <dd className="text-2xl font-bold text-neutral-text-primary">
                ₱{report.totalIncome.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-text-secondary">Paid orders</dt>
              <dd className="font-medium text-neutral-text-primary">
                {report.paidOrdersCount}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <EmptyState
          title="No completed orders in this period"
          description="Reports are based on recorded payments only."
        />
      )}
    </div>
  );
}
