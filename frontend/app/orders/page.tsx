"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { ordersApi, type OrderResponse } from "@/lib/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ordersApi
      .list()
      .then(setOrders)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load orders"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
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
    </div>
  );
}
