"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  ordersApi,
  type OrderTrackingResponse,
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

export default function TrackPage() {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = reference.trim();
    if (!ref) return;
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const result = await ordersApi.trackByReference(ref);
      setOrder(result);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "Reference number not found"
          : err instanceof ApiError
            ? err.message
            : "Failed to track order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Track Your Order
      </h1>
      <p className="mb-6 text-slate-600">
        Enter your order reference number (e.g. LDR-20260213-1234) to check
        status.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Reference number"
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Track"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {order && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Order {order.referenceNumber}
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="font-medium text-slate-800">
                {STATUS_LABELS[order.currentStatus] ?? order.currentStatus}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Customer</dt>
              <dd className="font-medium text-slate-800">
                {order.customerName ?? "—"}
              </dd>
            </div>
            {order.contactNumber && (
              <div>
                <dt className="text-sm text-slate-500">Contact</dt>
                <dd className="font-medium text-slate-800">
                  {order.contactNumber}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-slate-500">Payment</dt>
              <dd className="font-medium text-slate-800">
                {order.paymentStatus}
              </dd>
            </div>
            {order.grandTotal != null && (
              <div>
                <dt className="text-sm text-slate-500">Total</dt>
                <dd className="font-medium text-slate-800">
                  ₱{order.grandTotal.toFixed(2)}
                </dd>
              </div>
            )}
            {order.createdAt && (
              <div>
                <dt className="text-sm text-slate-500">Created</dt>
                <dd className="font-medium text-slate-800">
                  {new Date(order.createdAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
