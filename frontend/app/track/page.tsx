"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  ordersApi,
  type OrderTrackingResponse,
} from "@/lib/api/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Received",
  WASHING: "Washing",
  DRYING: "Drying",
  FOLDING: "Folding",
  READY_FOR_PICKUP: "Ready for Pickup",
  RELEASED: "Released",
  CANCELLED: "Cancelled",
};

const STATUS_MESSAGES: Record<string, string> = {
  RECEIVED: "We've received your laundry. We'll start processing it soon!",
  WASHING: "Your laundry is being washed. We'll have it ready for you soon!",
  DRYING: "Your laundry is drying. Almost there!",
  FOLDING: "We're folding your laundry. It will be ready for pickup shortly!",
  READY_FOR_PICKUP: "Your laundry is ready! Please come pick it up.",
  RELEASED: "Thank you! Your order has been completed.",
  CANCELLED: "This order has been cancelled.",
};

const STATUS_STEPS = [
  "RECEIVED",
  "WASHING",
  "DRYING",
  "FOLDING",
  "READY_FOR_PICKUP",
  "RELEASED",
] as const;

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
          ? "We couldn't find that order. Please check your reference number."
          : err instanceof ApiError
            ? err.message
            : "Failed to track order"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order?.currentStatus
    ? STATUS_STEPS.indexOf(order.currentStatus as (typeof STATUS_STEPS)[number])
    : -1;

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-12 min-h-[60vh] flex flex-col">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-text-primary sm:text-3xl">
          Faith Laundry Shop
        </h1>
        <p className="mt-2 text-lg font-medium text-neutral-text-secondary">
          Track Your Laundry
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8"
      >
        <label htmlFor="track-ref" className="sr-only">
          Reference number
        </label>
        <input
          id="track-ref"
          type="text"
          placeholder="Reference number (e.g. LDR-20260217-1234)"
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-neutral-border px-4 py-3 font-mono text-neutral-text-primary placeholder:text-neutral-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full min-h-[48px] rounded-lg bg-primary-500 py-3 font-medium text-white hover:bg-primary-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-busy={loading}
        >
          {loading ? "Searching…" : "Track Order"}
        </button>
      </form>

      {loading && (
        <div className="mt-6">
          <CardSkeleton />
        </div>
      )}

      {error && (
        <div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {order && (
        <div className="mt-8 rounded-lg border border-neutral-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-lg font-semibold text-neutral-text-primary">
              {order.referenceNumber}
            </p>
            <OrderStatusBadge status={order.currentStatus ?? ""} />
          </div>
          {order.createdAt && (
            <p className="mb-4 text-sm text-neutral-text-secondary">
              Placed: {new Date(order.createdAt).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </p>
          )}

          {/* Horizontal progress */}
          <div className="mb-6" aria-label="Status progress">
            <div className="flex items-center justify-between gap-1">
              {STATUS_STEPS.slice(0, -1).map((step, i) => {
                const isPast = currentIndex > i;
                const isCurrent = currentIndex === i;
                const isCancelled = order.currentStatus === "CANCELLED";
                return (
                  <div
                    key={step}
                    className={`flex flex-1 items-center ${i > 0 ? "flex-1" : ""}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        isCancelled
                          ? "bg-slate-200 text-slate-500"
                          : isPast
                            ? "bg-primary-500 text-white"
                            : isCurrent
                              ? "border-2 border-primary-500 bg-white text-primary-600"
                              : "border-2 border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {isPast ? "✓" : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 2 && (
                      <div
                        className={`mx-1 h-0.5 flex-1 ${
                          isPast ? "bg-primary-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-neutral-text-secondary sm:text-xs">
              <span>Received</span>
              <span>Washing</span>
              <span>Drying</span>
              <span>Folding</span>
              <span>Ready</span>
            </div>
          </div>

          <p className="font-medium text-neutral-text-primary">
            Current Status: {STATUS_LABELS[order.currentStatus ?? ""] ?? order.currentStatus}
          </p>
          <p className="mt-2 text-sm text-neutral-text-secondary">
            {STATUS_MESSAGES[order.currentStatus ?? ""] ??
              "Your order is being processed."}
          </p>

          {order.grandTotal != null && (
            <p className="mt-4 text-sm text-neutral-text-secondary">
              Total: ₱{order.grandTotal.toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
