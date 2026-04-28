import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reportsService } from "@/services/reports.service";

export type ChartPoint = { period: string; income: number; rawDate?: string };

/**
 * useWeeklySales Hook
 * Abstracts the logic for fetching the last 7 days of sales data.
 */
export function useWeeklySales() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChart = useCallback(async () => {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    const now = new Date();
    try {
      const promises = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().slice(0, 10);
        return reportsService.getDailySales(dateStr).then((res) => ({
          period: dateStr.slice(5),
          income: res.totalIncome,
          rawDate: dateStr
        }));
      });
      const points = await Promise.all(promises);
      setChartData(points);
    } catch {
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return { chartData, loading, refresh: fetchChart };
}
