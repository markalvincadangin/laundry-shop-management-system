"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Settings2, 
  Save, 
  X, 
  Edit2, 
  ShieldAlert, 
  Zap, 
  Scale, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRates } from "@/hooks/useRates";
import { ServiceRateResponse, UpdateServiceRateRequest } from "@/services/service-rates.service";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardContent, CardHeader, CardTitle, ConfirmDialog } from "@/components/ui";
import { Input, Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ErrorState, AccessDenied } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

/**
 * Service Rates Management — High Fidelity (v4.0)
 * Allows Admins to modify operational rates and load capacities.
 * Hardened with RBAC (Admin-only) and forensic guardrails.
 */
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
    <div className="max-w-4xl mx-auto space-y-grid-10 pb-grid-20 px-4 md:px-0">
      <PageHeader
        title={UI_LABELS.layout.nav.RATES}
        subtitle={UI_LABELS.modules.rates.SUBTITLE}
        icon={Settings2}
      />
      <div className="space-y-grid-6">
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
    <div className="max-w-4xl mx-auto space-y-grid-8 pb-grid-20 px-4 md:px-0">
      <PageHeader
        variant="premium"
        title={UI_LABELS.layout.nav.RATES}
        subtitle={UI_LABELS.modules.rates.SUBTITLE}
        icon={Settings2}
      />

      {loading ? (
        <div className="space-y-grid-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-grid-8"
        >
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
        </motion.div>
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
  
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    await onSave({
      serviceName: form.serviceName || undefined,
      basePricePerLoad: form.basePricePerLoad,
      kgLimitPerLoad: form.kgLimitPerLoad,
      pricePerExtraMinute: form.pricePerExtraMinute,
      isActive: form.isActive,
    });
    setShowConfirm(false);
  };

  return (
    <>
      <Card className={`overflow-hidden group border-slate-200/60 shadow-sm transition-all duration-300 rounded-[32px] ${isEditing ? 'ring-2 ring-brand-blue/20 ring-offset-4 shadow-xl' : 'hover:shadow-md'}`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-grid-4 border-b border-slate-100 bg-slate-50/50 p-grid-6 md:p-grid-8">
          <div className="flex items-center gap-grid-5">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-all ${rate.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              <Zap className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-slate-900 font-black text-2xl tracking-tight leading-none">
                {rate.serviceName || `${UI_LABELS.modules.rates.SERVICE_PREFIX}${rate.id}`}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${rate.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${rate.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {rate.isActive ? UI_LABELS.shared.common.ACTIVE : UI_LABELS.modules.rates.SUSPENDED_LABEL}
                </span>
              </div>
            </div>
          </div>
          {!isEditing && (
            <Button 
              variant="outline" 
              onClick={onEdit} 
              className="h-12 px-grid-6 gap-grid-2 text-brand-blue border-slate-200 bg-white hover:bg-brand-blue/5 hover:border-brand-blue/20 transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest rounded-xl shadow-sm"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {UI_LABELS.modules.rates.MODIFY_RATE}
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-grid-6 md:p-grid-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-grid-8">
              <div className="grid gap-grid-6 md:grid-cols-2">
                <Input
                  label={UI_LABELS.modules.rates.SERVICE_LABEL}
                  value={form.serviceName}
                  onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                  className="h-14 rounded-xl border-slate-200 bg-white focus:bg-white"
                  required
                />
                <Input
                  label={UI_LABELS.modules.rates.BASE_PRICE}
                  type="number"
                  step="0.01"
                  value={form.basePricePerLoad}
                  onChange={(e) => setForm((f) => ({ ...f, basePricePerLoad: parseFloat(e.target.value) || 0 }))}
                  className="h-14 rounded-xl border-slate-200 bg-white font-mono tracking-wider"
                  required
                />
                <Input
                  label={UI_LABELS.modules.rates.KG_CAPACITY}
                  type="number"
                  step="0.1"
                  value={form.kgLimitPerLoad}
                  onChange={(e) => setForm((f) => ({ ...f, kgLimitPerLoad: parseFloat(e.target.value) || 0 }))}
                  className="h-14 rounded-xl border-slate-200 bg-white font-mono tracking-wider"
                  required
                />
                <Input
                  label={UI_LABELS.modules.rates.EXTRA_SURCHARGE}
                  type="number"
                  step="0.01"
                  value={form.pricePerExtraMinute}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerExtraMinute: parseFloat(e.target.value) || 0 }))}
                  className="h-14 rounded-xl border-slate-200 bg-white font-mono tracking-wider"
                  required
                />
              </div>

              <div className="flex items-center gap-4 p-grid-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-slate-200">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <input
                    type="checkbox"
                    id={`active-${rate.id}`}
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 bg-white text-brand-blue focus:ring-brand-blue/50 transition-all cursor-pointer"
                  />
                </div>
                <label htmlFor={`active-${rate.id}`} className="text-sm font-bold text-slate-600 cursor-pointer select-none">
                  {UI_LABELS.modules.rates.MAINTAIN_ACTIVE}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-grid-3 pt-grid-4">
                <Button 
                  type="submit" 
                  isLoading={saving} 
                  className="h-14 px-grid-10 gap-grid-2 bg-brand-blue shadow-lg shadow-brand-blue/25 font-black uppercase text-[11px] tracking-widest rounded-xl transition-all active:scale-95"
                >
                  <Save className="h-4.5 w-4.5" />
                  {UI_LABELS.modules.rates.COMMIT_CHANGES}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onCancel} 
                  disabled={saving} 
                  className="h-14 px-grid-8 gap-grid-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-black uppercase text-[11px] tracking-widest rounded-xl border border-transparent hover:border-slate-100 transition-all active:scale-95"
                >
                  <X className="h-4.5 w-4.5" />
                  {UI_LABELS.shared.buttons.DISCARD}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-grid-8 sm:grid-cols-3">
              <div className="space-y-grid-2 group/stat">
                <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Zap className="h-3 w-3 text-brand-blue" />
                  {UI_LABELS.modules.rates.BASE_RATE}
                </dt>
                <dd className="flex items-baseline gap-1">
                  <CurrencyDisplay amount={rate.basePricePerLoad} className="text-4xl font-black text-slate-900 tracking-tighter" />
                </dd>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 bg-brand-blue/5 inline-block px-2 py-1 rounded-lg">
                  Per {rate.kgLimitPerLoad}{UI_LABELS.shared.units.WEIGHT.toLowerCase()} load
                </p>
              </div>
              
              <div className="space-y-grid-2 group/stat">
                <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Scale className="h-3 w-3 text-brand-blue" />
                  {UI_LABELS.modules.rates.LOAD_CAPACITY}
                </dt>
                <dd className="text-4xl font-black text-slate-900 tracking-tighter">
                  {rate.kgLimitPerLoad}
                  <span className="text-sm font-bold text-slate-400 ml-1 uppercase">{UI_LABELS.shared.units.WEIGHT}</span>
                </dd>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {UI_LABELS.modules.rates.HARDWARE_LIMIT}
                </p>
              </div>

              <div className="space-y-grid-2 group/stat">
                <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-amber-500" />
                  {UI_LABELS.modules.rates.EXTRA_TIME_SURCHARGE}
                </dt>
                <dd className="flex items-baseline gap-1">
                  <CurrencyDisplay amount={rate.pricePerExtraMinute} className="text-4xl font-black text-slate-900 tracking-tighter" />
                </dd>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 bg-amber-50 inline-block px-2 py-1 rounded-lg">
                  {UI_LABELS.modules.rates.PER_MINUTE}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Apply Rate Changes?"
        description="Updating service rates will immediately affect all new orders. This action is audited for forensic transparency."
        confirmText="Confirm Changes"
        isDestructive={false}
        icon={ShieldAlert}
        isLoading={saving}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

