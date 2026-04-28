"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings2, Save, X, Edit2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRates } from "@/hooks/useRates";
import { ServiceRateResponse, UpdateServiceRateRequest } from "@/services/service-rates.service";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Input, Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ErrorState, AccessDenied } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { formatCurrency } from "@/lib/utils";
export default function RatesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <RatesLoading />;
  }

  return <RatesContent />;
}

function RatesLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <PageHeader
        title={UI_LABELS.layout.nav.RATES}
        subtitle={UI_LABELS.modules.rates.SUBTITLE}
        icon={Settings2}
      />
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

function RatesContent() {
  const { user, loading: authLoading } = useAuth();
  const { rates, loading, error, refresh, updateRate, isUpdating } = useRates();
  const [editingId, setEditingId] = useState<number | null>(null);

  if (authLoading) {
    return <RatesLoading />;
  }

  if (user?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <PageHeader
        title={UI_LABELS.layout.nav.RATES}
        subtitle={UI_LABELS.modules.rates.SUBTITLE}
        icon={Settings2}
      />

      {loading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="grid gap-8">
          {rates.map((rate) => (
            <RateCard
              key={rate.id}
              rate={rate}
              isEditing={editingId === rate.id}
              onEdit={() => setEditingId(rate.id)}
              onCancel={() => setEditingId(null)}
              onSave={async (body) => {
                await updateRate(rate.id!, body);
                setEditingId(null);
              }}
              saving={isUpdating}
            />
          ))}
        </div>
      )}
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
    <Card className="overflow-hidden group bg-white border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50">
        <div className="space-y-1">
          <CardTitle className="text-slate-900 font-display text-xl tracking-tight">
            {rate.serviceName || `${UI_LABELS.modules.rates.SERVICE_PREFIX}${rate.id}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${rate.isActive ? 'bg-brand-cyan-dark shadow-[0_0_8px_rgba(26,127,168,0.5)]' : 'bg-slate-400'}`} />
            <span className={`text-xs font-bold uppercase tracking-tight ${rate.isActive ? 'text-brand-cyan-dark' : 'text-slate-500'}`}>
              {rate.isActive ? UI_LABELS.shared.common.ACTIVE : UI_LABELS.modules.rates.SUSPENDED_LABEL}
            </span>
          </div>
        </div>
        {!isEditing && (
          <Button variant="outline" size="lg" onClick={onEdit} className="h-12 px-6 gap-2 text-brand-cyan-dark border-slate-200 hover:border-brand-cyan-dark hover:text-brand-cyan-dark hover:bg-brand-cyan/5 transition-all active:scale-95 font-bold uppercase text-xs tracking-widest">
            <Edit2 className="h-3.5 w-3.5" />
            {UI_LABELS.modules.rates.MODIFY_RATE}
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-8">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label={UI_LABELS.modules.rates.SERVICE_LABEL}
                value={form.serviceName}
                onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                className="border-slate-200 bg-white"
              />
              <Input
                label={UI_LABELS.modules.rates.BASE_PRICE}
                type="number"
                step="0.01"
                value={form.basePricePerLoad}
                onChange={(e) => setForm((f) => ({ ...f, basePricePerLoad: parseFloat(e.target.value) || 0 }))}
                className="border-slate-200 bg-white"
              />
              <Input
                label={UI_LABELS.modules.rates.KG_CAPACITY}
                type="number"
                step="0.01"
                value={form.kgLimitPerLoad}
                onChange={(e) => setForm((f) => ({ ...f, kgLimitPerLoad: parseFloat(e.target.value) || 0 }))}
                className="border-slate-200 bg-white"
              />
              <Input
                label={UI_LABELS.modules.rates.EXTRA_SURCHARGE}
                type="number"
                step="0.01"
                value={form.pricePerExtraMinute}
                onChange={(e) => setForm((f) => ({ ...f, pricePerExtraMinute: parseFloat(e.target.value) || 0 }))}
                className="border-slate-200 bg-white"
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[56px]">
              <input
                type="checkbox"
                id={`active-${rate.id}`}
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-6 w-6 rounded border-slate-300 bg-white text-brand-blue focus:ring-brand-blue/50 transition-all"
              />
              <label htmlFor={`active-${rate.id}`} className="text-sm font-medium text-slate-700 cursor-pointer">
                {UI_LABELS.modules.rates.MAINTAIN_ACTIVE}
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={saving} className="h-14 px-10 gap-2 bg-brand-blue shadow-lg shadow-brand-blue/20 font-extrabold uppercase text-xs tracking-widest">
                <Save className="h-4 w-4" />
                {UI_LABELS.modules.rates.COMMIT_CHANGES}
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel} disabled={saving} className="h-14 px-8 gap-2 hover:bg-slate-50 font-bold uppercase text-xs tracking-widest">
                <X className="h-4 w-4" />
                {UI_LABELS.shared.buttons.DISCARD}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{UI_LABELS.modules.rates.BASE_RATE}</dt>
              <dd className="text-3xl font-display font-bold text-slate-900 tracking-tighter">{formatCurrency(rate.basePricePerLoad)}</dd>
              <p className="text-xs uppercase font-bold tracking-tight text-brand-cyan-dark mt-1">Per {rate.kgLimitPerLoad}{UI_LABELS.shared.units.WEIGHT.toLowerCase()} load</p>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{UI_LABELS.modules.rates.LOAD_CAPACITY}</dt>
              <dd className="text-3xl font-display font-bold text-slate-900 tracking-tighter">{rate.kgLimitPerLoad} <span className="text-sm font-sans font-medium text-slate-500">{UI_LABELS.shared.units.WEIGHT.toUpperCase()}</span></dd>
              <p className="text-xs uppercase font-bold tracking-tight text-slate-400 mt-1">{UI_LABELS.modules.rates.HARDWARE_LIMIT}</p>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{UI_LABELS.modules.rates.EXTRA_TIME_SURCHARGE}</dt>
              <dd className="text-3xl font-display font-bold text-slate-900 tracking-tighter">{formatCurrency(rate.pricePerExtraMinute)}</dd>
              <p className="text-xs uppercase font-bold tracking-tight text-amber-600 mt-1">{UI_LABELS.modules.rates.PER_MINUTE}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

