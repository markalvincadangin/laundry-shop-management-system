"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { customersApi, type CustomerResponse } from "@/lib/api/customers";
import {
  ordersApi,
  type OrderPreviewResponse,
  type OrderResponse,
} from "@/lib/api/orders";
import type { components } from "@/types/api.generated";

type AddOnInput = components["schemas"]["AddOnInput"];

const KG_PER_LOAD = 8;

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const staffUserId = user?.userId ?? null;
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
  });
  const [weightKg, setWeightKg] = useState("");
  const [extraMinutes, setExtraMinutes] = useState("0");
  const [addOns, setAddOns] = useState<AddOnInput[]>([]);
  const [newAddOn, setNewAddOn] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const useNewCustomer =
    showNewCustomer ||
    newCustomer.firstName.trim() !== "" ||
    newCustomer.lastName.trim() !== "" ||
    newCustomer.contactNumber.trim() !== "";

  const weightNum = parseFloat(weightKg);
  const loadsHint =
    !isNaN(weightNum) && weightNum > 0
      ? `= ${Math.ceil(weightNum / KG_PER_LOAD)} load${Math.ceil(weightNum / KG_PER_LOAD) > 1 ? "s" : ""}`
      : null;

  const fetchPreview = useCallback(async () => {
    const w = parseFloat(weightKg);
    if (isNaN(w) || w <= 0) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await ordersApi.preview({
        weightKg: w,
        extraMinutes: parseInt(extraMinutes, 10) || 0,
        initialAddOns:
          addOns.length > 0
            ? addOns.map((a) => ({
                name: a.name,
                price: typeof a.price === "number" ? a.price : Number(a.price),
                quantity: a.quantity ?? 1,
              }))
            : undefined,
      });
      setPreview(res);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [weightKg, extraMinutes, addOns]);

  useEffect(() => {
    const t = setTimeout(fetchPreview, 300);
    return () => clearTimeout(t);
  }, [fetchPreview]);

  useEffect(() => {
    if (search.length >= 2 && !showNewCustomer) {
      customersApi
        .list(search)
        .then(setCustomers)
        .catch(() => setCustomers([]));
    } else {
      setCustomers([]);
    }
  }, [search, showNewCustomer]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!staffUserId) {
        setError("Please sign in to create orders.");
        return;
      }
      const weight = parseFloat(weightKg);
      if (isNaN(weight) || weight <= 0) {
        setError("Weight must be greater than 0");
        return;
      }

      setLoading(true);
      try {
        const body: Parameters<typeof ordersApi.create>[0] = {
          createdByUserId: staffUserId,
          weightKg: weight,
          extraMinutes: parseInt(extraMinutes, 10) || 0,
        };

        if (useNewCustomer) {
          if (
            !newCustomer.firstName.trim() ||
            !newCustomer.lastName.trim() ||
            !newCustomer.contactNumber.trim()
          ) {
            setError("New customer requires first name, last name, and contact number");
            setLoading(false);
            return;
          }
          body.customer = {
            firstName: newCustomer.firstName.trim(),
            lastName: newCustomer.lastName.trim(),
            contactNumber: newCustomer.contactNumber.trim(),
          };
        } else if (selectedCustomerId) {
          body.customerId = selectedCustomerId;
        } else {
          setError("Select a customer or enter new customer details");
          setLoading(false);
          return;
        }

        if (addOns.length > 0) {
          body.initialAddOns = addOns.map((a) => ({
            name: a.name,
            price: typeof a.price === "number" ? a.price : Number(a.price),
            quantity: a.quantity ?? 1,
          }));
        }

        const order = await ordersApi.create(body);
        const ref = (order as OrderResponse).referenceNumber;
        toast.success("Order created successfully", {
          description: ref,
          action: {
            label: "Copy",
            onClick: () => {
              void navigator.clipboard.writeText(ref);
              toast.success("Reference copied to clipboard");
            },
          },
        });
        router.push(`/orders/${order.id}`);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Failed to create order";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [
      staffUserId,
      weightKg,
      extraMinutes,
      selectedCustomerId,
      newCustomer,
      useNewCustomer,
      addOns,
      router,
    ]
  );

  const addAddOn = () => {
    const name = newAddOn.name.trim();
    const price = parseFloat(newAddOn.price);
    if (name && !isNaN(price) && price >= 0) {
      setAddOns((prev) => [...prev, { name, price, quantity: 1 }]);
      setNewAddOn({ name: "", price: "" });
    }
  };

  const removeAddOn = (index: number) => {
    setAddOns((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary">
        New Order
      </h1>

      {!staffUserId && (
        <div className="mb-4 rounded-lg bg-amber-50 p-4 text-amber-800">
          Please sign in to create orders.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="rounded-lg bg-red-50 p-4 text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="customer-search"
                className="mb-2 block text-sm font-medium text-neutral-text-primary"
              >
                Customer
              </label>
              {!showNewCustomer ? (
                <>
                  <input
                    id="customer-search"
                    type="text"
                    placeholder="Search by name or contact…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedCustomerId(null);
                    }}
                    className="w-full rounded-lg border border-neutral-border px-3 py-2 text-neutral-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(true)}
                    className="mt-2 text-sm text-primary-500 hover:underline"
                  >
                    + New Customer
                  </button>
                  {customers.length > 0 && (
                    <ul className="mt-1 max-h-40 overflow-auto rounded-lg border border-neutral-border bg-white shadow-sm">
                      {customers.map((c) => (
                        <li
                          key={c.id}
                          className="cursor-pointer px-3 py-2 hover:bg-slate-50"
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setSearch(`${c.firstName} ${c.lastName}`);
                            setCustomers([]);
                          }}
                        >
                          {c.firstName} {c.lastName} ({c.contactNumber})
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCustomer(false);
                      setNewCustomer({
                        firstName: "",
                        lastName: "",
                        contactNumber: "",
                      });
                    }}
                    className="text-sm text-neutral-text-secondary hover:underline"
                  >
                    ← Back to search
                  </button>
                </div>
              )}
            </div>

            {useNewCustomer && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="first-name"
                    className="mb-1 block text-sm font-medium text-neutral-text-primary"
                  >
                    First name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) =>
                      setNewCustomer((p) => ({ ...p, firstName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-border px-3 py-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="mb-1 block text-sm font-medium text-neutral-text-primary"
                  >
                    Last name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) =>
                      setNewCustomer((p) => ({ ...p, lastName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-border px-3 py-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact"
                    className="mb-1 block text-sm font-medium text-neutral-text-primary"
                  >
                    Contact number
                  </label>
                  <input
                    id="contact"
                    type="text"
                    value={newCustomer.contactNumber}
                    onChange={(e) =>
                      setNewCustomer((p) => ({
                        ...p,
                        contactNumber: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-border px-3 py-2"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="weight"
                  className="mb-1 block text-sm font-medium text-neutral-text-primary"
                >
                  Weight (kg) *
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full rounded-lg border border-neutral-border px-3 py-2"
                />
                {loadsHint && (
                  <p className="mt-1 text-xs text-neutral-text-secondary">
                    {loadsHint}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="extra-minutes"
                  className="mb-1 block text-sm font-medium text-neutral-text-primary"
                >
                  Extra minutes
                </label>
                <input
                  id="extra-minutes"
                  type="number"
                  min="0"
                  value={extraMinutes}
                  onChange={(e) => setExtraMinutes(e.target.value)}
                  className="w-full rounded-lg border border-neutral-border px-3 py-2"
                />
                <p className="mt-1 text-xs text-neutral-text-secondary">
                  First 45 min/load included. ₱1 per extra minute.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-text-primary">
                Add-ons
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newAddOn.name}
                  onChange={(e) =>
                    setNewAddOn((p) => ({ ...p, name: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-neutral-border px-3 py-2"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={newAddOn.price}
                  onChange={(e) =>
                    setNewAddOn((p) => ({ ...p, price: e.target.value }))
                  }
                  className="w-24 rounded-lg border border-neutral-border px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addAddOn}
                  className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-neutral-text-primary hover:bg-slate-50"
                >
                  Add
                </button>
              </div>
              {addOns.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {addOns.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded bg-slate-100 px-3 py-2 text-sm"
                    >
                      {a.name} — ₱{Number(a.price).toFixed(2)}
                      <button
                        type="button"
                        onClick={() => removeAddOn(i)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <div className="sticky top-6 rounded-lg border border-neutral-border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-neutral-text-primary">
                Price Preview
              </h3>
              {previewLoading ? (
                <div className="flex items-center gap-2 text-neutral-text-secondary">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                  Calculating…
                </div>
              ) : preview ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-text-secondary">
                      Weight: {weightKg} kg → {preview.totalLoads} loads
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-text-secondary">Base:</span>
                    <span>₱{preview.baseAmount?.toFixed(2)}</span>
                  </div>
                  {(preview.extraMinutesAmount ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-text-secondary">
                        Extra mins:
                      </span>
                      <span>
                        {extraMinutes} min × ₱1 = ₱
                        {preview.extraMinutesAmount?.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(preview.addonsTotalAmount ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-text-secondary">
                        Add-ons:
                      </span>
                      <span>₱{preview.addonsTotalAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-border pt-3">
                    <div className="flex justify-between text-lg font-bold text-primary-600">
                      <span>Grand Total</span>
                      <span>₱{preview.grandTotal?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-text-secondary">
                  Enter weight to see live price preview.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !staffUserId}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-500 px-6 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Recording Order…" : "Record Order"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-neutral-border bg-white px-6 py-2 font-medium text-neutral-text-primary hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
