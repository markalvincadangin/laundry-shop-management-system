"use client";

import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Settings2, 
  Save, 
  WashingMachine, 
  Banknote,
  Scale, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText
} from "lucide-react";
import { 
  Modal, 
  Input, 
  Button, 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { ServiceRateResponse } from "@/lib/api/service-rates";
import { useRates } from "@/hooks/useRates";

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate?: ServiceRateResponse | null;
  onSuccess: () => void;
}

/**
 * Service Rate Management Modal — High Fidelity (v4.0)
 * Standardized modal for creating and updating laundry service pricing.
 * Adheres to FRONT-001 §7 and §3.1.6 standards.
 */
export function RateModal({ isOpen, onClose, rate, onSuccess }: RateModalProps) {
  const { createRate, updateRate, isCreating, isUpdating } = useRates();
  const loading = isCreating || isUpdating;

  const [form, setForm] = useState({
    serviceName: "",
    basePricePerLoad: "",
    kgLimitPerLoad: "",
    pricePerExtraMinute: "",
    isActive: true,
  });

  useEffect(() => {
    if (rate && isOpen) {
      setForm({
        serviceName: rate.serviceName,
        basePricePerLoad: rate.basePricePerLoad.toString(),
        kgLimitPerLoad: rate.kgLimitPerLoad.toString(),
        pricePerExtraMinute: rate.pricePerExtraMinute.toString(),
        isActive: rate.isActive,
      });
    } else if (!rate && isOpen) {
      setForm({
        serviceName: "",
        basePricePerLoad: "140",
        kgLimitPerLoad: "8",
        pricePerExtraMinute: "1",
        isActive: true,
      });
    }
  }, [rate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        serviceName: form.serviceName,
        basePricePerLoad: parseFloat(form.basePricePerLoad),
        kgLimitPerLoad: parseFloat(form.kgLimitPerLoad),
        pricePerExtraMinute: parseFloat(form.pricePerExtraMinute),
        isActive: form.isActive,
      };

      if (rate) {
        await updateRate(rate.id, payload);
      } else {
        await createRate(payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      // Errors handled by hook toasts
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={rate ? UI_LABELS.modules.rates.EDIT_RATE : UI_LABELS.modules.rates.CREATE_RATE}
      size="md"
      className="rounded-[40px] overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-grid-6 md:p-grid-8 space-y-grid-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl opacity-40 pointer-events-none" />
        
        <Input
          label={UI_LABELS.modules.rates.SERVICE_LABEL}
          value={form.serviceName}
          onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
          required
          placeholder="e.g., Full Service, Self-Service"
          icon={<WashingMachine className="h-4 w-4 text-brand-blue" />}
          className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6">
          <Input
            label={UI_LABELS.modules.rates.BASE_PRICE}
            type="number"
            step="0.01"
            value={form.basePricePerLoad}
            onChange={(e) => setForm({ ...form, basePricePerLoad: e.target.value })}
            required
            icon={<Banknote className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
          <Input
            label={UI_LABELS.modules.rates.WEIGHT_LIMIT}
            type="number"
            step="0.1"
            value={form.kgLimitPerLoad}
            onChange={(e) => setForm({ ...form, kgLimitPerLoad: e.target.value })}
            required
            icon={<Scale className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6">
          <Input
            label={UI_LABELS.modules.rates.EXTRA_CHARGE}
            type="number"
            step="0.01"
            value={form.pricePerExtraMinute}
            onChange={(e) => setForm({ ...form, pricePerExtraMinute: e.target.value })}
            required
            icon={<Clock className="h-4 w-4 text-brand-blue" />}
            className="h-14 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="space-y-grid-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">
            {UI_LABELS.shared.common.STATUS}
          </span>
          <div className="flex gap-grid-4">
            <Button
              type="button"
              variant={form.isActive ? "primary" : "outline"}
              onClick={() => setForm({ ...form, isActive: true })}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              className={`flex-1 h-14 rounded-xl transition-all font-black uppercase text-[11px] tracking-widest ${
                form.isActive 
                  ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
                  : 'text-slate-400 bg-slate-50/50 border-slate-100 hover:bg-slate-100'
              }`}
            >
              {UI_LABELS.modules.rates.OFFERED}
            </Button>
            <Button
              type="button"
              variant={!form.isActive ? "danger" : "outline"}
              onClick={() => setForm({ ...form, isActive: false })}
              leftIcon={<XCircle className="h-4 w-4" />}
              className={`flex-1 h-14 rounded-xl transition-all font-black uppercase text-[11px] tracking-widest ${
                !form.isActive 
                  ? 'bg-rose-500 border-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200' 
                  : 'text-slate-400 bg-slate-50/50 border-slate-100 hover:bg-slate-100'
              }`}
            >
              {UI_LABELS.modules.rates.SUSPENDED_LABEL}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-grid-4 pt-grid-4">
          <Button
            type="submit"
            isLoading={loading}
            className="flex-[2] h-14 bg-brand-blue shadow-lg shadow-brand-blue/25 uppercase font-black text-[11px] tracking-widest active:scale-95 transition-all rounded-xl"
          >
            <Save className="h-5 w-5" />
            {UI_LABELS.shared.buttons.SAVE}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-14 border-slate-100 uppercase font-black text-[11px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-xl"
          >
            {UI_LABELS.shared.buttons.CANCEL}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
