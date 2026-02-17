"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";

export default function PayOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<{ grandTotal: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

    setSubmitting(true);
    try {
      await paymentsApi.create({
        orderId,
        amountPaid: amount,
        receivedByUserId: staffUserId,
        paymentMethod,
      });
      toast.success("Payment recorded successfully");
      router.push(`/orders/${orderId}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to record payment";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading order…</div>;
  }

  if (error && !order) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
        <Link href="/orders" className="ml-4 text-blue-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Record Payment
      </h1>

      {order && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Order total</p>
          <p className="text-2xl font-bold text-slate-800">
            ₱{order.grandTotal.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Amount must match order total (validation from API)
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Amount paid (₱) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Payment method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "CASH" | "GCASH" | "BANK_TRANSFER"
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="CASH">Cash</option>
            <option value="GCASH">GCash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || !staffUserId}
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Recording…" : "Record Payment"}
          </button>
          <Link
            href={`/orders/${orderId}`}
            className="rounded-lg border border-slate-300 bg-white px-6 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
