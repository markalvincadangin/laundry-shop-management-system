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
  type UpdateOrderRequest,
} from "@/lib/api/orders";
import type { components } from "@/types/api.generated";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

type AddOnInput = components["schemas"]["AddOnInput"];

const NEXT_STATUS: Record<string, string[]> = {
  RECEIVED: ["WASHING", "CANCELLED"],
  WASHING: ["DRYING"],
  DRYING: ["FOLDING"],
  FOLDING: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["RELEASED"],
  RELEASED: [],
  CANCELLED: [],
};

const NEXT_STATUS_LABELS: Record<string, string> = {
  WASHING: "Move to Washing",
  DRYING: "Move to Drying",
  FOLDING: "Move to Folding",
  READY_FOR_PICKUP: "Move to Ready for Pickup",
  RELEASED: "Release Order",
  CANCELLED: "Cancel Order",
};

function OrderEditForm({
  order,
  onSaved,
  onError,
}: {
  order: OrderResponse;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(order.extraMinutes ?? 0);
  const [addOns, setAddOns] = useState<AddOnInput[]>(
    (order.addOns ?? []).map((a) => ({
      name: a.name,
      price: typeof a.price === "number" ? a.price : Number(a.price),
      quantity: a.quantity ?? 1,
    }))
  );
  const [newAddOn, setNewAddOn] = useState({ name: "", price: "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: UpdateOrderRequest = {
        extraMinutes,
        addOns: addOns.length > 0 ? addOns : undefined,
      };
      await ordersApi.update(order.id!, body);
      toast.success("Order updated successfully");
      onSaved();
      setExpanded(false);
    } catch (err) {
      onError(
        err instanceof ApiError ? (err as ApiError).message : "Failed to update order"
      );
    } finally {
      setSaving(false);
    }
  };

  const addAddOn = () => {
    const price = parseFloat(newAddOn.price);
    if (!newAddOn.name.trim() || isNaN(price) || price <= 0) return;
    setAddOns((prev) => [
      ...prev,
      { name: newAddOn.name.trim(), price, quantity: 1 },
    ]);
    setNewAddOn({ name: "", price: "" });
  };

  const removeAddOn = (idx: number) => {
    setAddOns((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-lg border border-neutral-border bg-white p-6 shadow-sm no-print">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold text-neutral-text-primary">
          Edit Order
        </h2>
        <span className="text-neutral-text-secondary">
          {expanded ? "Collapse" : "Expand"}
        </span>
      </button>
      {expanded && (
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
              Extra minutes (e.g. extended washing)
            </label>
            <input
              type="number"
              min={0}
              value={extraMinutes}
              onChange={(e) => setExtraMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-neutral-border px-3 py-2 text-neutral-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
              Add-ons
            </label>
            {addOns.map((a, i) => (
              <div
                key={i}
                className="mb-2 flex items-center gap-2 rounded border border-neutral-border bg-slate-50 px-3 py-2"
              >
                <span className="flex-1 text-sm">
                  {a.name} - PHP {a.price.toFixed(2)}
                  {a.quantity > 1 ? ` x ${a.quantity}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => removeAddOn(i)}
                  className="text-sm text-danger-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add-on name"
                value={newAddOn.name}
                onChange={(e) => setNewAddOn((n) => ({ ...n, name: e.target.value }))}
                className="flex-1 rounded-lg border border-neutral-border px-3 py-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={newAddOn.price}
                onChange={(e) => setNewAddOn((n) => ({ ...n, price: e.target.value }))}
                className="w-24 rounded-lg border border-neutral-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addAddOn}
                className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              disabled={saving}
              className="rounded-lg border border-neutral-border bg-white px-4 py-2 font-medium text-neutral-text-primary hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
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

  const [showReleaseModal, setShowReleaseModal] = useState(false);

  const updateStatus = async (newStatus: string) => {
    if (!staffUserId) return;
    if (newStatus === "RELEASED") {
      setShowReleaseModal(true);
      return;
    }
    await doUpdateStatus(newStatus);
  };

  const doUpdateStatus = async (newStatus: string) => {
    if (!staffUserId) return;
    setUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, {
        newStatus: newStatus as OrderResponse["currentStatus"],
        changedByUserId: staffUserId,
      });
      toast.success("Status updated successfully");
      setShowReleaseModal(false);
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
    return <CardSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error ?? "Order not found"}
      </div>
    );
  }

  // BR-PAY-01 / To-Be Flow: Cannot release until payment is recorded
  const allowedNextStatuses = (NEXT_STATUS[order.currentStatus!] ?? []).filter(
    (s) => s !== "RELEASED" || order.paymentStatus === "PAID"
  );

  const canUpdateStatus =
    order.currentStatus &&
    allowedNextStatuses.length > 0 &&
    order.currentStatus !== "RELEASED" &&
    order.currentStatus !== "CANCELLED";

  const showReleaseHint =
    order.currentStatus === "READY_FOR_PICKUP" &&
    order.paymentStatus !== "PAID";

  const canEditOrder =
    order.paymentStatus !== "PAID" &&
    order.currentStatus !== "RELEASED" &&
    order.currentStatus !== "CANCELLED";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="text-slate-500 hover:text-slate-700"
            aria-label="Back to orders"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-neutral-text-primary font-mono">
            Order {order.referenceNumber}
          </h1>
          <OrderStatusBadge status={order.currentStatus ?? ""} />
        </div>
        <div className="flex flex-wrap gap-2">
          {order.paymentStatus !== "PAID" && (
            <Link
              href={`/orders/${order.id}/pay`}
              className="rounded-lg bg-success-600 px-4 py-2 font-medium text-white hover:bg-success-600/90 min-h-[44px] flex items-center"
            >
              Record Payment
            </Link>
          )}
          <Link
            href="/orders"
            className="rounded-lg border border-neutral-border bg-white px-4 py-2 font-medium text-neutral-text-primary hover:bg-slate-50 min-h-[44px] flex items-center"
          >
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="print-receipt rounded-lg border border-neutral-border bg-white p-6 shadow-sm">
            <div className="mb-4 text-center">
              <p className="font-bold text-neutral-text-primary">Faith Laundry Shop</p>
              <p className="text-sm font-mono text-neutral-text-secondary">
                {order.referenceNumber}
              </p>
            </div>
            <h2 className="mb-4 text-lg font-semibold text-neutral-text-primary">
              Order Summary
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-neutral-text-secondary">Weight</dt>
                <dd className="font-medium">{order.weightKg} kg ({order.totalLoads} loads)</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-text-secondary">Extra minutes</dt>
                <dd className="font-medium">{order.extraMinutes ?? 0} min</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-text-secondary">Base amount</dt>
                <dd className="font-medium">₱{order.baseAmount?.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-text-secondary">Extra minutes</dt>
                <dd className="font-medium">₱{order.extraMinutesAmount?.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-text-secondary">Add-ons</dt>
                <dd className="font-medium">₱{order.addonsTotalAmount?.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-text-secondary">Grand total</dt>
                <dd className="text-lg font-bold text-primary-600">
                  ₱{order.grandTotal?.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          {canEditOrder && (
            <OrderEditForm
              order={order}
              onSaved={fetchOrder}
              onError={(msg) => {
                setError(msg);
                toast.error(msg);
              }}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-border bg-white p-6 shadow-sm no-print">
            <h2 className="mb-4 text-lg font-semibold text-neutral-text-primary">
              Status Timeline
            </h2>
            <OrderStatusTimeline
              currentStatus={order.currentStatus ?? ""}
              statusLogs={order.statusLogs ?? []}
            />
          </div>

          {(canUpdateStatus || showReleaseHint) && staffUserId && (
            <div className="no-print rounded-lg border border-neutral-border bg-white p-6 shadow-sm">
              {showReleaseHint && (
                <p className="mb-3 text-sm text-warning-600">
                  Record payment before releasing this order.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {allowedNextStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={updating}
                    aria-label={NEXT_STATUS_LABELS[status] ?? `Update to ${status}`}
                    className={`min-h-[44px] touch-manipulation rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                      status === "CANCELLED"
                        ? "border border-danger-600 text-danger-600 hover:bg-red-50"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    }`}
                  >
                    {updating ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Updating…
                      </span>
                    ) : (
                      NEXT_STATUS_LABELS[status] ?? `→ ${status}`
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showReleaseModal && order && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="release-modal-title"
            >
              <div className="max-w-md rounded-lg border border-neutral-border bg-white p-6 shadow-lg">
                <h2 id="release-modal-title" className="text-lg font-semibold text-neutral-text-primary">
                  Confirm Release
                </h2>
                <p className="mt-2 text-sm text-neutral-text-secondary">
                  Release this order to the customer? This action cannot be undone.
                </p>
                <dl className="mt-4 space-y-2 rounded bg-slate-50 p-4">
                  <div>
                    <dt className="text-xs text-neutral-text-secondary">Reference</dt>
                    <dd className="font-mono font-medium">{order.referenceNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-text-secondary">Grand Total</dt>
                    <dd className="font-medium">₱{order.grandTotal?.toFixed(2)}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => doUpdateStatus("RELEASED")}
                    disabled={updating}
                    className="flex-1 rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                  >
                    {updating ? "Releasing…" : "Confirm Release"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReleaseModal(false)}
                    disabled={updating}
                    className="rounded-lg border border-neutral-border bg-white px-4 py-2 font-medium text-neutral-text-primary hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
