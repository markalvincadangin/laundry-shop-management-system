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

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type ChartPoint = { period: string; income: number; orders: number };

export default function ReportsPage() {
  const [date, setDate] = useState(() => formatDate(new Date()));
  const [report, setReport] = useState<{
    date: string;
    totalIncome: number;
    paidOrdersCount: number;
  } | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(() => {
    setError(null);
    setLoading(true);
    reportsApi
      .getDailySales(date)
      .then(setReport)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load report"
        );
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    const now = new Date();
    const points: ChartPoint[] = [];
    try {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);
        const res = await reportsApi.getDailySales(dateStr);
        points.push({
          period: dateStr,
          income: res.totalIncome,
          orders: res.paidOrdersCount,
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
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Daily Sales Report
      </h1>
      <p className="mb-6 text-slate-600">
        View aggregated income from paid orders for a given date.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="report-date" className="mb-1 block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="report-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Last 7 Days — Sales Trend
        </h2>
        {chartLoading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <div className="h-64 rounded-lg border border-slate-200 bg-white p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value != null ? [`₱${value.toFixed(2)}`, "Income"] : ["—", "Income"]
                  }
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Bar
                  dataKey="income"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Income"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No sales data for the last 7 days.
          </p>
        )}
      </div>

      {loading && !report ? (
        <CardSkeleton />
      ) : report ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {report.date}
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">Total income</dt>
              <dd className="text-2xl font-bold text-slate-800">
                ₱{report.totalIncome.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Paid orders</dt>
              <dd className="font-medium text-slate-800">
                {report.paidOrdersCount}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
