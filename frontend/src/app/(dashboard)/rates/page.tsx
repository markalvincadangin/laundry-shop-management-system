/* eslint-disable react/jsx-no-literals */
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
  Tag
} from "lucide-react";
import { useAuth } from "@/stores/auth-store";
import { useRates } from "@/hooks/useRates";
import { ServiceRateResponse } from "@/lib/api/service-rates";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ErrorState, AccessDenied } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { RateModal } from "@/components/features/rates/RateModal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AddOnCatalogList } from "@/components/features/rates/AddOnCatalogList";

/**
 * Service Rates Management — High Fidelity (v5.0)
 * Allows Admins to modify operational rates and load capacities.
 * Hardened with RBAC (Admin-only) and forensic guardrails.
 * v4.0 Consistency Pass: Premium PageHeader, standardized grid width (5xl for cards), and refined spacing.
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
    <div className="max-w-5xl mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
      <PageHeader
        title={UI_LABELS.layout.nav.RATES}
        subtitle={UI_LABELS.modules.rates.SUBTITLE}
        icon={Tag}
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
  const [activeTab, setActiveTab] = useState<string>("rates");

  if (authLoading) {
    return <RatesLoading />;
  }

  if (user?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
      <PageHeader
        variant="premium"
        title={UI_LABELS.modules.rates.TITLE}
        subtitle={UI_LABELS.modules.rates.SUBTITLE}
        icon={Tag}
        actions={
          <Button 
            onClick={() => {
              setSelectedRate(null);
              setIsModalOpen(true);
            }}
            className="h-14 px-grid-8 gap-grid-3 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase font-black text-caption tracking-widest rounded-2xl active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" />
            {UI_LABELS.modules.rates.CREATE_RATE}
          </Button>
        }
      />

      <div className="flex justify-center mb-8">
        <SegmentedControl 
          options={[
            { label: "Service Rates", value: "rates" },
            { label: "Add-On Catalog", value: "addons" }
          ]} 
          value={activeTab} 
          onChange={setActiveTab} 
        />
      </div>

      {activeTab === "addons" ? (
        <AddOnCatalogList />
      ) : loading ? (
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
          transition={{ duration: 0.6 }}
          className="grid gap-grid-10"
        >
          {rates.map((rate) => (
            <RateCard
              key={rate.id}
              rate={rate}
              onEdit={() => {
                setSelectedRate(rate);
                setIsModalOpen(true);
              }}
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
    <Card className="overflow-hidden group border-slate-200/60 shadow-2xl shadow-slate-200/20 transition-all duration-500 rounded-[2.5rem] hover:shadow-brand-blue/10 hover:border-brand-blue/30 bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-grid-4 border-b border-slate-100/60 bg-slate-50/30 p-grid-6 md:p-grid-10 transition-colors group-hover:bg-brand-blue/[0.02]">
        <div className="flex items-center gap-grid-5">
          <div className={`h-20 w-20 rounded-[24px] flex items-center justify-center border-2 shadow-sm transition-all duration-500 ${
            rate.isActive 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:scale-110 group-hover:rotate-3' 
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            <WashingMachine className={`h-10 w-10 ${rate.isActive ? 'fill-emerald-600/10' : ''}`} strokeWidth={2.5} />
          </div>
          <div className="space-y-grid-2">
            <CardTitle className="text-slate-900 font-black text-3xl tracking-tight leading-none">
              {rate.serviceName || `${UI_LABELS.modules.rates.SERVICE_PREFIX}${rate.id}`}
            </CardTitle>
            <div className="flex items-center gap-grid-3">
              <div className={`h-2.5 w-2.5 rounded-full ${rate.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${rate.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {rate.isActive ? UI_LABELS.modules.rates.OFFERED : UI_LABELS.modules.rates.SUSPENDED_LABEL}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={onEdit} 
          className="h-14 px-grid-8 gap-grid-3 text-brand-blue border-slate-200 bg-white hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all active:scale-95 font-black uppercase text-caption tracking-widest rounded-2xl shadow-sm"
        >
          <Edit3 className="h-4 w-4" />
          {UI_LABELS.modules.rates.MODIFY_RATE}
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100/60">
          {/* Standard Rate */}
          <div className="p-grid-10 space-y-grid-4 group/stat hover:bg-slate-50/50 transition-colors">
            <dt className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <Banknote className="h-3.5 w-3.5 text-brand-blue" />
              </div>
              {UI_LABELS.modules.rates.BASE_RATE}
            </dt>
            <dd className="flex items-baseline gap-1.5">
              <CurrencyDisplay amount={rate.basePricePerLoad} className="text-5xl font-black text-slate-900 tracking-tighter" />
            </dd>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 bg-brand-blue/5 inline-block px-3 py-1.5 rounded-xl border border-brand-blue/10">
                Per {rate.kgLimitPerLoad}{UI_LABELS.shared.units.WEIGHT.toLowerCase()} {UI_LABELS.dynamic.LOAD}
              </p>
            </div>
          </div>
          
          {/* Capacity */}
          <div className="p-grid-10 space-y-grid-4 group/stat hover:bg-slate-50/50 transition-colors">
            <dt className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Scale className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              {UI_LABELS.modules.rates.LOAD_CAPACITY}
            </dt>
            <dd className="text-5xl font-black text-slate-900 tracking-tighter">
              {rate.kgLimitPerLoad}
              <span className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-normal">{UI_LABELS.shared.units.WEIGHT}</span>
            </dd>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
              {UI_LABELS.modules.rates.HARDWARE_LIMIT}
            </p>
          </div>

          {/* Overtime */}
          <div className="p-grid-10 space-y-grid-4 group/stat hover:bg-slate-50/50 transition-colors">
            <dt className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
              </div>
              {UI_LABELS.modules.rates.EXTRA_TIME_SURCHARGE}
            </dt>
            <dd className="flex items-baseline gap-1.5">
              <CurrencyDisplay amount={rate.pricePerExtraMinute} className="text-5xl font-black text-slate-900 tracking-tighter" />
            </dd>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 bg-amber-50 inline-block px-3 py-1.5 rounded-xl border border-amber-100">
                {UI_LABELS.modules.rates.PER_MINUTE}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
