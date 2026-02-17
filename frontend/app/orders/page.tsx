"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  ordersApi,
  type OrderResponse,
  type OrderListParams,
  type OrderStatsResponse,
} from "@/lib/api/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [stats, setStats] = useState<OrderStatsResponse | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<OrderListParams>({});
  const [appliedFilters, setAppliedFilters] = useState<OrderListParams>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    ordersApi.getStats(today).then(setStats).catch(() => setStats(null));
  }, []);

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
        const msg = err instanceof ApiError ? err.message : "Failed to load orders";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [page, size, appliedFilters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilterChange = (key: keyof OrderListParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(0);
  };

  if (loading && orders.length === 0) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <Link
            href="/orders/new"
            className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
          >
            New Order
          </Link>
        </div>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-text-primary">Orders</h1>
        <Link
          href="/orders/new"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
        >
          + New Order
        </Link>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-border bg-slate-50 p-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-text-secondary">
            Status
          </label>
          <select
            className="rounded border border-neutral-border px-2 py-1.5 text-sm"
            value={filters.status ?? ""}
            onChange={(e) =>
              handleFilterChange("status", e.target.value || undefined)
            }
          >
            <option value="">All</option>
            <option value="RECEIVED">Received</option>
            <option value="WASHING">Washing</option>
            <option value="DRYING">Drying</option>
            <option value="FOLDING">Folding</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="RELEASED">Released</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-text-secondary">
            Payment
          </label>
          <select
            className="rounded border border-neutral-border px-2 py-1.5 text-sm"
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
          <label className="mb-1 block text-xs font-medium text-neutral-text-secondary">
            From
          </label>
          <input
            type="date"
            className="rounded border border-neutral-border px-2 py-1.5 text-sm"
            value={filters.from ?? ""}
            onChange={(e) => handleFilterChange("from", e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-text-secondary">
            To
          </label>
          <input
            type="date"
            className="rounded border border-neutral-border px-2 py-1.5 text-sm"
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
        <EmptyState
          title="No orders yet today"
          description="Tap + New Order to get started."
          action={
            <Link
              href="/orders/new"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
            >
              + New Order
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[640px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Payment
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
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
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.currentStatus ?? ""} />
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                    {order.paymentStatus}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-800">
                    ₱{order.grandTotal?.toFixed(2) ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-text-secondary">
            Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)}{" "}
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
    </div>
  );
}
