"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  ordersApi,
  type OrderResponse,
  type OrderListParams,
} from "@/lib/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<OrderListParams>({});
  const [appliedFilters, setAppliedFilters] = useState<OrderListParams>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    ordersApi
      .list({ ...appliedFilters, page, size })
      .then((res) => {
        setOrders(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load orders"
        );
      })
      .finally(() => setLoading(false));
  }, [page, size, appliedFilters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key: keyof OrderListParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(0);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="text-slate-600">Loading orders…</div>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <Link
          href="/orders/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          New Order
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Status
          </label>
          <select
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={filters.status ?? ""}
            onChange={(e) =>
              handleFilterChange("status", e.target.value || undefined)
            }
          >
            <option value="">All</option>
            <option value="RECEIVED">Received</option>
            <option value="WASHING">Washing</option>
            <option value="DRYING">Drying</option>
            <option value="READY">Ready</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Payment
          </label>
          <select
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={filters.paymentStatus ?? ""}
            onChange={(e) =>
              handleFilterChange("paymentStatus", e.target.value || undefined)
            }
          >
            <option value="">All</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            From
          </label>
          <input
            type="date"
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={filters.from ?? ""}
            onChange={(e) => handleFilterChange("from", e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            To
          </label>
          <input
            type="date"
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={filters.to ?? ""}
            onChange={(e) => handleFilterChange("to", e.target.value || undefined)}
          />
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-slate-600">No orders yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Payment
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-slate-800">
                    {order.referenceNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {order.currentStatus}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {order.paymentStatus}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-800">
                    ₱{order.grandTotal?.toFixed(2) ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)}{" "}
            of {totalElements}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
