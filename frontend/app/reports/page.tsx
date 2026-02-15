"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { reportsApi } from "@/lib/api/reports";

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReportsPage() {
  const [date, setDate] = useState(() => formatDate(new Date()));
  const [report, setReport] = useState<{
    date: string;
    totalIncome: number;
    paidOrdersCount: number;
  } | null>(null);
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

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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

      {report && (
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
      )}
    </div>
  );
}
