"use client";

import Link from "next/link";
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
import { reportsApi } from "@/lib/api/reports";
import { HealthCheckButton } from "@/components/HealthCheckButton";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type ChartPoint = { period: string; income: number };

export default function Home() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const points: ChartPoint[] = [];
    try {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);
        const res = await reportsApi.getDailySales(dateStr);
        points.push({ period: dateStr, income: res.totalIncome });
      }
      setChartData(points);
    } catch {
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Faith Laundry Shop</h1>
      <p className="mt-2 text-slate-600">Order management and tracking</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/orders/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          New Order
        </Link>
        <Link
          href="/orders"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          View Orders
        </Link>
        <Link
          href="/track"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Track Order
        </Link>
        <Link
          href="/reports"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Daily Report
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Sales — Last 7 Days
        </h2>
        {loading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <div className="h-48 rounded-lg border border-slate-200 bg-white p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
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

      <div className="mt-8">
        <HealthCheckButton />
      </div>
    </div>
  );
}
