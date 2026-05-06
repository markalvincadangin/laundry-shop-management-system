"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Scale, 
  Clock, 
  Plus,
  WashingMachine,
  Banknote,
  Edit3,
  Settings2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRates } from "@/hooks/useRates";
import { ServiceRateResponse } from "@/services/service-rates.service";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ErrorState, AccessDenied } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { RateModal } from "@/components/features/rates/RateModal";

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
  const { rates, loading, error, refresh } = useRates();
  const [selectedRate, setSelectedRate] = useState<ServiceRateResponse | null | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = () => {
    setSelectedRate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rate: ServiceRateResponse) => {
    setSelectedRate(rate);
    setIsModalOpen(true);
  };

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
        title={UI_LABELS.modules.rates.TITLE}
        subtitle={UI_LABELS.modules.rates.SUBTITLE}
        icon={Edit3}
        actions={
          <Button 
            onClick={() => {
              setSelectedRate(null);
              setIsModalOpen(true);
            }}
            className="h-12 px-grid-8 gap-grid-2 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase font-black text-[11px] tracking-widest rounded-2xl active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" />
            {UI_LABELS.modules.rates.CREATE_RATE}
          </Button>
        }
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
              onEdit={() => handleEdit(rate)}
            />
          ))}
        </motion.div>
      )}

      <RateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rate={selectedRate}
        onSuccess={() => refresh()}
      />
    </div>
  );
}

function RateCard({
  rate,
  onEdit,
}: {
  rate: ServiceRateResponse;
  onEdit: () => void;
}) {
  return (
    <Card className="overflow-hidden group border-slate-200/60 shadow-sm transition-all duration-500 rounded-[32px] hover:shadow-xl hover:shadow-slate-200/50 hover:border-brand-blue/30 bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-grid-4 border-b border-slate-50 bg-slate-50/30 p-grid-6 md:p-grid-8 transition-colors group-hover:bg-brand-blue/[0.02]">
        <div className="flex items-center gap-grid-5">
          <div className={`h-16 w-16 rounded-[22px] flex items-center justify-center border-2 shadow-sm transition-all duration-500 ${
            rate.isActive 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:scale-110 group-hover:rotate-3' 
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            <WashingMachine className={`h-8 w-8 ${rate.isActive ? 'fill-emerald-600/10' : ''}`} strokeWidth={2.5} />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-slate-900 font-black text-2xl tracking-tight leading-none">
              {rate.serviceName || `${UI_LABELS.modules.rates.SERVICE_PREFIX}${rate.id}`}
            </CardTitle>
            <div className="flex items-center gap-2.5">
              <div className={`h-2.5 w-2.5 rounded-full ${rate.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${rate.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {rate.isActive ? UI_LABELS.modules.rates.OFFERED : UI_LABELS.modules.rates.SUSPENDED_LABEL}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={onEdit} 
          className="h-12 px-grid-8 gap-grid-2 text-brand-blue border-slate-200 bg-white hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-sm"
        >
          <Edit3 className="h-4 w-4" />
          {UI_LABELS.modules.rates.MODIFY_RATE}
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Standard Rate */}
          <div className="p-grid-8 space-y-grid-3 group/stat hover:bg-slate-50/50 transition-colors">
            <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <Banknote className="h-3.5 w-3.5 text-brand-blue" />
              </div>
              {UI_LABELS.modules.rates.BASE_RATE}
            </dt>
            <dd className="flex items-baseline gap-1.5">
              <CurrencyDisplay amount={rate.basePricePerLoad} className="text-4xl font-black text-slate-900 tracking-tighter" />
            </dd>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 bg-brand-blue/5 inline-block px-2.5 py-1.5 rounded-xl border border-brand-blue/10">
                Per {rate.kgLimitPerLoad}{UI_LABELS.shared.units.WEIGHT.toLowerCase()} load
              </p>
            </div>
          </div>
          
          {/* Capacity */}
          <div className="p-grid-8 space-y-grid-3 group/stat hover:bg-slate-50/50 transition-colors">
            <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Scale className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              {UI_LABELS.modules.rates.LOAD_CAPACITY}
            </dt>
            <dd className="text-4xl font-black text-slate-900 tracking-tighter">
              {rate.kgLimitPerLoad}
              <span className="text-sm font-bold text-slate-400 ml-1.5 uppercase tracking-normal">{UI_LABELS.shared.units.WEIGHT}</span>
            </dd>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
              {UI_LABELS.modules.rates.HARDWARE_LIMIT}
            </p>
          </div>

          {/* Overtime */}
          <div className="p-grid-8 space-y-grid-3 group/stat hover:bg-slate-50/50 transition-colors">
            <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
              </div>
              {UI_LABELS.modules.rates.EXTRA_TIME_SURCHARGE}
            </dt>
            <dd className="flex items-baseline gap-1.5">
              <CurrencyDisplay amount={rate.pricePerExtraMinute} className="text-4xl font-black text-slate-900 tracking-tighter" />
            </dd>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 bg-amber-50 inline-block px-2.5 py-1.5 rounded-xl border border-amber-100">
                {UI_LABELS.modules.rates.PER_MINUTE}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

