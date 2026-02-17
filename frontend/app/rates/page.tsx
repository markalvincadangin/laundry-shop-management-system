"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import {
  serviceRatesApi,
  type ServiceRateResponse,
  type UpdateServiceRateRequest,
} from "@/lib/api/service-rates";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

export default function RatesPage() {
  const { user } = useAuth();
  const [rates, setRates] = useState<ServiceRateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchRates = useCallback(() => {
    setError(null);
    setLoading(true);
    serviceRatesApi
      .list(false)
      .then(setRates)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load rates"
        );
        setRates([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  if (user?.role !== "OWNER") {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Access denied. Owner only.
      </div>
    );
  }

  if (loading) {
    return <CardSkeleton />;
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
      <h1 className="mb-6 text-2xl font-bold text-neutral-text-primary font-mono">
        Service Rates
      </h1>
      <p className="mb-6 text-sm text-neutral-text-secondary">
        Manage pricing rules for laundry services. Changes apply to new orders only.
      </p>
      <div className="space-y-6">
        {rates.map((rate) => (
          <RateCard
            key={rate.id}
            rate={rate}
            isEditing={editingId === rate.id}
            onEdit={() => setEditingId(rate.id)}
            onCancel={() => setEditingId(null)}
            onSave={async (body) => {
              setSaving(true);
              try {
                await serviceRatesApi.update(rate.id!, body);
                toast.success("Rate updated successfully");
                setEditingId(null);
                fetchRates();
              } catch (err) {
                const msg =
                  err instanceof ApiError ? err.message : "Failed to update rate";
                toast.error(msg);
              } finally {
                setSaving(false);
              }
            }}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
}

function RateCard({
  rate,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  saving,
}: {
  rate: ServiceRateResponse;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (body: UpdateServiceRateRequest) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    serviceName: rate.serviceName ?? "",
    basePricePerLoad: rate.basePricePerLoad ?? 120,
    kgLimitPerLoad: rate.kgLimitPerLoad ?? 8,
    pricePerExtraMinute: rate.pricePerExtraMinute ?? 1,
    isActive: rate.isActive ?? true,
  });

  useEffect(() => {
    if (isEditing) {
      setForm({
        serviceName: rate.serviceName ?? "",
        basePricePerLoad: rate.basePricePerLoad ?? 120,
        kgLimitPerLoad: rate.kgLimitPerLoad ?? 8,
        pricePerExtraMinute: rate.pricePerExtraMinute ?? 1,
        isActive: rate.isActive ?? true,
      });
    }
  }, [isEditing, rate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      serviceName: form.serviceName || undefined,
      basePricePerLoad: form.basePricePerLoad,
      kgLimitPerLoad: form.kgLimitPerLoad,
      pricePerExtraMinute: form.pricePerExtraMinute,
      isActive: form.isActive,
    });
  };

  return (
    <div className="rounded-lg border border-neutral-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-neutral-text-primary font-mono">
          {rate.serviceName || `Rate #${rate.id}`}
        </h2>
        {rate.isActive && (
          <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-medium text-success-700">
            Active
          </span>
        )}
        {!rate.isActive && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-neutral-text-secondary">
            Inactive
          </span>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
              Service name
            </label>
            <input
              type="text"
              value={form.serviceName}
              onChange={(e) =>
                setForm((f) => ({ ...f, serviceName: e.target.value }))
              }
              className="w-full rounded-lg border border-neutral-border px-3 py-2 text-neutral-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                Base price per load (PHP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.basePricePerLoad}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    basePricePerLoad: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-neutral-border px-3 py-2 text-neutral-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
                Kg limit per load
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.kgLimitPerLoad}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    kgLimitPerLoad: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-neutral-border px-3 py-2 text-neutral-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
              Price per extra minute (PHP)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.pricePerExtraMinute}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  pricePerExtraMinute: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full rounded-lg border border-neutral-border px-3 py-2 text-neutral-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`active-${rate.id}`}
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-neutral-border text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`active-${rate.id}`} className="text-sm text-neutral-text-secondary">
              Active (used for new orders)
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-neutral-border bg-white px-4 py-2 font-medium text-neutral-text-primary hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-neutral-text-secondary">Base price per load</dt>
              <dd className="font-medium">PHP {rate.basePricePerLoad?.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-text-secondary">Kg limit per load</dt>
              <dd className="font-medium">{rate.kgLimitPerLoad} kg</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-text-secondary">Price per extra minute</dt>
              <dd className="font-medium">PHP {rate.pricePerExtraMinute?.toFixed(2)}</dd>
            </div>
          </dl>
          <button
            onClick={onEdit}
            className="mt-4 rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-medium text-neutral-text-primary hover:bg-slate-50"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}
