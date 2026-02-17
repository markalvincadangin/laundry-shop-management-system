"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import {
  paymentsApi,
  type PaymentResponse,
  type PaymentPageResponse,
} from "@/lib/api/payments";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    setError(null);
    paymentsApi
      .list({ from: from || undefined, to: to || undefined, page, size: 20 })
      .then((res: PaymentPageResponse) => {
        setPayments(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load payments");
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, [from, to, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  if (user?.role !== "OWNER") {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Access denied. Owner only.
      </div>
    );
  }

  if (loading && payments.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary">
          Payment History
        </h1>
        <TableSkeleton rows={8} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary">
        Payment History
      </h1>
      <p className="mb-6 text-sm text-neutral-text-secondary">
        View payment records. Filter by date range.
      </p>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-border bg-slate-50 p-3">
        <div>
          <label htmlFor="payments-from" className="mb-1 block text-xs font-medium text-neutral-text-secondary">
            From
          </label>
          <input
            id="payments-from"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(0);
            }}
            className="rounded border border-neutral-border px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="payments-to" className="mb-1 block text-xs font-medium text-neutral-text-secondary">
            To
          </label>
          <input
            id="payments-to"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(0);
            }}
            className="rounded border border-neutral-border px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No payments recorded"
          description="No completed orders in this period."
          action={
            <Link
              href="/orders"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
            >
              View Orders
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[640px] overflow-hidden rounded-lg border border-neutral-border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-neutral-border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                    Method
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border bg-white">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-neutral-text-primary">
                      {p.orderReferenceNumber ?? `#${p.orderId}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                      {p.customerName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-neutral-text-primary">
                      ₱{p.amountPaid?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                      {p.paymentDate ? formatDate(p.paymentDate) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                      {p.paymentMethod?.replace(/_/g, " ") ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/orders/${p.orderId}`}
                        className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-neutral-text-secondary">
                Showing {page * 20 + 1}–{Math.min((page + 1) * 20, totalElements)}{" "}
                of {totalElements}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                  className="rounded border border-neutral-border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                  className="rounded border border-neutral-border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
