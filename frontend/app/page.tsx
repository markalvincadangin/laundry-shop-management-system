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
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi, type OrderStatsResponse } from "@/lib/api/orders";
import { reportsApi } from "@/lib/api/reports";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";
import { StatCard } from "@/components/ui/StatCard";

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type ChartPoint = { period: string; income: number };

export default function Home() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [stats, setStats] = useState<OrderStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    try {
      // Fetch all 7 days in parallel for better performance
      const promises = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = formatDate(d);
        return reportsApi.getDailySales(dateStr).then((res) => ({
          period: dateStr,
          income: res.totalIncome,
        }));
      });
      const points = await Promise.all(promises);
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

  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      ordersApi.getStats(today).then(setStats).catch(() => setStats(null));
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-text-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-text-secondary">
          Overview of today&apos;s operations
        </p>
      </div>

      {user && stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard title="Today's Orders" value={stats.todaysOrders} />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            subtitle="Washing / Drying / Folding"
          />
          <StatCard
            title="Ready for Pickup"
            value={stats.readyForPickup}
            variant="accent"
          />
          <StatCard
            title="Unpaid Orders"
            value={stats.unpaidOrders}
            variant="warning"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/orders/new"
          className="inline-flex items-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors"
        >
          New Order
        </Link>
        <Link
          href="/orders"
          className="inline-flex items-center rounded-lg border border-neutral-border bg-white px-4 py-2.5 text-sm font-medium text-neutral-text-primary shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors"
        >
          View Orders
        </Link>
        <Link
          href="/track"
          className="inline-flex items-center rounded-lg border border-neutral-border bg-white px-4 py-2.5 text-sm font-medium text-neutral-text-primary shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors"
        >
          Track Order
        </Link>
        {user?.role === "OWNER" && (
          <Link
            href="/reports"
            className="inline-flex items-center rounded-lg border border-neutral-border bg-white px-4 py-2.5 text-sm font-medium text-neutral-text-primary shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors"
          >
            Reports
          </Link>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-text-primary">
          Sales — Last 7 Days
        </h2>
        {loading ? (
          <ChartSkeleton />
        ) : chartData.length > 0 ? (
          <div className="h-48 rounded-xl border border-neutral-border bg-white p-4 shadow-sm">
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
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  name="Income"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="rounded-xl border border-neutral-border bg-neutral-base p-4 text-sm text-neutral-text-secondary">
            No sales data for the last 7 days.
          </p>
        )}
      </div>
    </div>
  );
}
