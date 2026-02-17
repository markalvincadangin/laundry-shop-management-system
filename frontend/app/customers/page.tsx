"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { customersApi, type CustomerResponse } from "@/lib/api/customers";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    setError(null);
    customersApi
      .list(search || undefined)
      .then(setCustomers)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load customers");
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchCustomers, search]);

  if (loading && customers.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary">
          Customers
        </h1>
        <TableSkeleton rows={8} cols={4} />
      </div>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-text-primary">
          Customers
        </h1>
        <Link
          href="/orders/new"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
        >
          + New Order
        </Link>
      </div>

      <div className="mb-4">
        <label htmlFor="customer-search" className="mb-1 block text-sm font-medium text-neutral-text-secondary">
          Search by name or contact
        </label>
        <input
          id="customer-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type to search..."
          className="w-full max-w-md rounded-lg border border-neutral-border px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          aria-describedby="search-hint"
        />
        <p id="search-hint" className="mt-1 text-xs text-neutral-text-secondary">
          Enter at least 2 characters to search
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={
            search
              ? "Try a different search term."
              : "Customers will appear when you create orders. Create a new order to add a customer."
          }
          action={
            <Link
              href="/orders/new"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600"
            >
              + New Order
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[480px] overflow-hidden rounded-lg border border-neutral-border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-neutral-border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Contact
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border bg-white">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-text-primary">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-text-secondary">
                    {c.contactNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/orders/new?customerId=${c.id}`}
                      className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      New Order
                    </Link>
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
