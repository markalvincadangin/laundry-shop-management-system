"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  notificationsApi,
  type NotificationResponse,
} from "@/lib/api/notifications";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  SENT: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificationsApi
      .list()
      .then(setNotifications)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load notifications"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary">
          Notifications
        </h1>
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-text-primary">Notifications</h1>
        <Link
          href="/orders"
          className="rounded-lg border border-neutral-border bg-white px-4 py-2 font-medium text-neutral-text-primary hover:bg-slate-50"
        >
          Back to Orders
        </Link>
      </div>
      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Notifications appear when orders reach Ready for Pickup."
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
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-neutral-text-primary">
                    {n.referenceNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                    {n.customerName ?? "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-neutral-text-secondary">
                    {n.message}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        STATUS_COLORS[n.status ?? ""] ?? "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-text-secondary">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {n.orderId && (
                      <Link
                        href={`/orders/${n.orderId}`}
                        className="text-primary-600 hover:underline"
                      >
                        View Order
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
