"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { customersApi, type CustomerResponse } from "@/lib/api/customers";
import { ordersApi } from "@/lib/api/orders";
import type { components } from "@/types/api.generated";

type AddOnInput = components["schemas"]["AddOnInput"];

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

  const useNewCustomer =
    showNewCustomer ||
    newCustomer.firstName.trim() !== "" ||
    newCustomer.lastName.trim() !== "" ||
    newCustomer.contactNumber.trim() !== "";

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
            price: a.price,
            quantity: a.quantity ?? 1,
          }));
        }

        const order = await ordersApi.create(body);
        router.push(`/orders/${order.id}`);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to create order"
        );
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
      <h1 className="mb-6 text-2xl font-bold text-slate-800">New Order</h1>

      {!staffUserId && (
        <div className="mb-4 rounded-lg bg-amber-50 p-4 text-amber-800">
          Please sign in to create orders.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Customer
          </label>
          {!showNewCustomer ? (
            <>
              <input
                type="text"
                placeholder="Search by name or contact…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedCustomerId(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNewCustomer(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                + Create new customer
              </button>
              {customers.length > 0 && (
                <ul className="mt-1 max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white shadow">
                  {customers.map((c) => (
                    <li
                      key={c.id}
                      className="cursor-pointer px-3 py-2 hover:bg-slate-100"
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
                className="text-sm text-slate-600 hover:underline"
              >
                ← Back to search
              </button>
            </div>
          )}
        </div>

        {useNewCustomer && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                type="text"
                value={newCustomer.firstName}
                onChange={(e) =>
                  setNewCustomer((p) => ({ ...p, firstName: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Last name
              </label>
              <input
                type="text"
                value={newCustomer.lastName}
                onChange={(e) =>
                  setNewCustomer((p) => ({ ...p, lastName: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contact number
              </label>
              <input
                type="text"
                value={newCustomer.contactNumber}
                onChange={(e) =>
                  setNewCustomer((p) => ({
                    ...p,
                    contactNumber: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Extra minutes
            </label>
            <input
              type="number"
              min="0"
              value={extraMinutes}
              onChange={(e) => setExtraMinutes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
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
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
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
              className="w-24 rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={addAddOn}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
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
                  {a.name} — ₱{a.price?.toFixed(2)}
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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !staffUserId}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Order"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-300 bg-white px-6 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
