"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import {
  ordersApi,
  type OrderResponse,
  type OrderStatusLogResponse,
} from "@/lib/api/orders";

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Received",
  WASHING: "Washing",
  DRYING: "Drying",
  FOLDING: "Folding",
  READY_FOR_PICKUP: "Ready for Pickup",
  RELEASED: "Released",
  CANCELLED: "Cancelled",
};

const NEXT_STATUS: Record<string, string[]> = {
  RECEIVED: ["WASHING", "CANCELLED"],
  WASHING: ["DRYING"],
  DRYING: ["FOLDING"],
  FOLDING: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["RELEASED"],
  RELEASED: [],
  CANCELLED: [],
};

function StatusTimeline({ logs }: { logs: OrderStatusLogResponse[] }) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-slate-500">No status history yet.</p>;
  }
  return (
    <div className="space-y-3">
      {logs.map((log, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div className="flex-1">
            <span className="font-medium text-slate-800">
              {log.previousStatus
                ? `${STATUS_LABELS[log.previousStatus] ?? log.previousStatus} → `
                : ""}
              {STATUS_LABELS[log.newStatus] ?? log.newStatus}
            </span>
            {log.changedAt && (
              <p className="mt-1 text-xs text-slate-500">
                {new Date(log.changedAt).toLocaleString()}
              </p>
            )}
            {log.notes && (
              <p className="mt-1 text-sm text-slate-600">{log.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const staffUserId = user?.userId ?? null;

  const fetchOrder = useCallback(() => {
    ordersApi
      .getById(orderId)
      .then(setOrder)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load order"
        );
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    if (!staffUserId) return;
    setUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, {
        newStatus: newStatus as OrderResponse["currentStatus"],
        changedByUserId: staffUserId,
      });
      toast.success("Status updated successfully");
      fetchOrder();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update status";
      setError(msg);
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading order…</div>;
  }

  if (error || !order) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error ?? "Order not found"}
      </div>
    );
  }

  const canUpdateStatus =
    order.currentStatus &&
    NEXT_STATUS[order.currentStatus]?.length > 0 &&
    order.currentStatus !== "RELEASED" &&
    order.currentStatus !== "CANCELLED";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Order {order.referenceNumber}
          </h1>
          <p className="mt-1 text-slate-600">
            Status: {STATUS_LABELS[order.currentStatus ?? ""] ?? order.currentStatus} • Payment:{" "}
            {order.paymentStatus}
          </p>
        </div>
        <div className="flex gap-2">
          {order.paymentStatus !== "PAID" && (
            <Link
              href={`/orders/${order.id}/pay`}
              className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
            >
              Record Payment
            </Link>
          )}
          <Link
            href="/orders"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="print-receipt rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 text-center">
            <p className="font-bold text-slate-800">Faith Laundry Shop</p>
            <p className="text-sm font-mono text-slate-600">
              {order.referenceNumber}
            </p>
          </div>
          <h2 className="mb-3 font-semibold text-slate-800">Order Details</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Customer ID</dt>
              <dd className="font-medium">{order.customerId}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Weight</dt>
              <dd className="font-medium">{order.weightKg} kg</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Loads</dt>
              <dd className="font-medium">{order.totalLoads}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Extra minutes</dt>
              <dd className="font-medium">{order.extraMinutes ?? 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Base amount</dt>
              <dd className="font-medium">₱{order.baseAmount?.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Extra minutes</dt>
              <dd className="font-medium">₱{order.extraMinutesAmount?.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Add-ons</dt>
              <dd className="font-medium">₱{order.addonsTotalAmount?.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Grand total</dt>
              <dd className="text-lg font-bold text-slate-800">
                ₱{order.grandTotal?.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm no-print">
          <h2 className="mb-3 font-semibold text-slate-800">Status Timeline</h2>
          <StatusTimeline logs={order.statusLogs ?? []} />
        </div>

        {canUpdateStatus && staffUserId && (
          <div className="no-print rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-800">
              Update Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {NEXT_STATUS[order.currentStatus!]?.map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={updating}
                  className="min-h-[44px] min-w-[44px] touch-manipulation rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:min-h-0 sm:min-w-0"
                >
                  → {STATUS_LABELS[status] ?? status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
