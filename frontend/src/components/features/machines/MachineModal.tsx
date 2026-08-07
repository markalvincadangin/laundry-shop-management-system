"use client";

import React, { useState, useEffect } from "react";
import { Save, Server } from "lucide-react";
import { 
  Modal, 
  Input, 
  Button, 
  Select
} from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { machinesService, MachineResponse, MachineStatus } from "@/lib/api/machines";
import { toast } from "sonner";

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: MachineResponse | null;
  onSuccess: () => void;
}

export function MachineModal({ isOpen, onClose, machine, onSuccess }: MachineModalProps) {
  const [loading, setLoading] = useState(false);
  const [operationId, setOperationId] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState({
    name: "",
    status: "OPERATIONAL" as MachineStatus,
  });

  useEffect(() => {
    if (machine && isOpen) {
      setForm({
        name: machine.name,
        status: machine.status,
      });
    } else if (!machine && isOpen) {
      setForm({
        name: "",
        status: "OPERATIONAL" as MachineStatus,
      });
    }
  }, [machine, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (machine) {
        await machinesService.updateStatus(machine.id, {
          status: form.status,
        });
      } else {
        await machinesService.create({ name: form.name });
      }
      toast.success(UI_LABELS.feedback.success.SAVED);
      onSuccess();
      onClose();
    } catch (err: any) {
      const isServerError = err.status >= 500;
      toast.error(isServerError ? UI_LABELS.feedback.error.GENERIC : (err.message || UI_LABELS.feedback.error.GENERIC));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={machine ? UI_LABELS.modules.machines.EDIT_MACHINE : UI_LABELS.modules.machines.ADD_MACHINE}
      size="md"
      className="rounded-[40px] overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-grid-6 md:p-grid-8 space-y-grid-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl opacity-40 pointer-events-none" />
        
        <div className="grid grid-cols-1 gap-grid-6">
          <Input
            label={UI_LABELS.modules.machines.FORM_NAME_LABEL}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={!!machine}
            icon={<Server className="h-4 w-4 text-brand-blue" />}
            className={`h-14 rounded-2xl border-slate-200 transition-all shadow-sm ${machine ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-70' : 'bg-white/50 focus:bg-white'}`}
          />
          {machine && (
            <Select
              label={UI_LABELS.modules.machines.FORM_STATUS_LABEL}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as MachineStatus })}
              required
              className="h-14 rounded-2xl border-slate-200 bg-white/50 shadow-sm"
            >
              <option value="OPERATIONAL">{UI_LABELS.modules.machines.STATUS_OPERATIONAL}</option>
              <option value="MAINTENANCE">{UI_LABELS.modules.machines.STATUS_MAINTENANCE}</option>
              <option value="OUT_OF_ORDER">{UI_LABELS.modules.machines.STATUS_OUT_OF_ORDER}</option>
            </Select>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-grid-4 pt-grid-4">
          <Button
            type="submit"
            requiresOnline
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
