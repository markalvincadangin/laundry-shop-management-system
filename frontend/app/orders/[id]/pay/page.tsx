"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import type { OrderResponse } from "@/lib/api/orders";

export default function PayOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    referenceNumber: string;
    amount: number;
  } | null>(null);
  const { user } = useAuth();
  const staffUserId = user?.userId ?? null;
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "GCASH" | "BANK_TRANSFER"
  >("CASH");

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

  useEffect(() => {
    if (order?.grandTotal != null) {
      setAmountPaid(order.grandTotal.toFixed(2));
    }
  }, [order?.grandTotal]);

  const amountNum = parseFloat(amountPaid);
  const amountMatches =
    order?.grandTotal != null &&
    !isNaN(amountNum) &&
    Math.abs(amountNum - order.grandTotal) < 0.01;
  const amountInvalid =
    !isNaN(amountNum) &&
    amountNum > 0 &&
    order?.grandTotal != null &&
    !amountMatches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!staffUserId) {
      setError("Staff user not available.");
      return;
    }
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (order && Math.abs(amount - order.grandTotal) >= 0.01) {
      setError(`Amount must match order total (₱${order.grandTotal.toFixed(2)})`);
      return;
    }

    setSubmitting(true);
    try {
      await paymentsApi.create({
        orderId,
        amountPaid: amount,
        receivedByUserId: staffUserId,
        paymentMethod,
      });
      setPaymentSuccess({
        referenceNumber: order?.referenceNumber ?? "",
        amount,
      });
      toast.success("Payment recorded successfully");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to record payment";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (error && !order) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
        <Link href="/orders" className="ml-4 text-primary-500 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-success-600/30 bg-success-50/30 p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-600 text-2xl text-white">
            ✓
          </div>
          <h2 className="text-xl font-bold text-neutral-text-primary">
            Payment Recorded
          </h2>
          <p className="mt-2 font-mono text-lg text-neutral-text-secondary">
            {paymentSuccess.referenceNumber}
          </p>
          <p className="mt-2 text-2xl font-bold text-success-600">
            ₱{paymentSuccess.amount.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-neutral-text-secondary">
            Thank you for your payment.
          </p>
          <Link
            href={`/orders/${orderId}`}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary-500 px-6 py-2 font-medium text-white hover:bg-primary-600"
          >
            Done
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary">
        Recording Payment for Order #{order?.referenceNumber ?? orderId}
      </h1>

      {order && (
        <div className="mb-6 rounded-lg border border-neutral-border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-neutral-text-primary">
            Order Summary
          </h2>
          <p className="text-sm text-neutral-text-secondary">
            Grand Total: ₱{order.grandTotal.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-neutral-text-secondary">
            Status: {order.currentStatus}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="rounded-lg bg-red-50 p-4 text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="amount-paid"
            className="mb-1 block text-sm font-medium text-neutral-text-primary"
          >
            Amount Received (₱) *
          </label>
          <input
            id="amount-paid"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${
              amountInvalid
                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                : amountMatches
                  ? "border-success-600 bg-success-50/50 focus:border-success-600 focus:ring-success-500/20"
                  : "border-neutral-border focus:border-primary-500 focus:ring-primary-500/20"
            }`}
            aria-invalid={amountInvalid}
            aria-describedby={amountInvalid ? "amount-error" : undefined}
          />
          {amountInvalid && (
            <p
              id="amount-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              Amount must match order total (₱{order?.grandTotal.toFixed(2)})
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="payment-method"
            className="mb-1 block text-sm font-medium text-neutral-text-primary"
          >
            Payment method
          </label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "CASH" | "GCASH" | "BANK_TRANSFER"
              )
            }
            className="w-full rounded-lg border border-neutral-border px-3 py-2"
          >
            <option value="CASH">Cash</option>
            <option value="GCASH">GCash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || !staffUserId || amountInvalid}
            className="min-h-[44px] rounded-lg bg-success-600 px-6 py-2 font-medium text-white hover:bg-success-600/90 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Recording…
              </span>
            ) : (
              "Confirm Payment"
            )}
          </button>
          <Link
            href={`/orders/${orderId}`}
            className="min-h-[44px] rounded-lg border border-neutral-border bg-white px-6 py-2 font-medium text-neutral-text-primary hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
