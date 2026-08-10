"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, Server, WashingMachine, AlertCircle, Zap, Clock } from "lucide-react";
import { 
  Modal, 
  Button,
} from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { OrderResponse } from "@/lib/api/orders";
import { useMachines } from "@/hooks/useMachines";
import { MachineResponse } from "@/lib/api/machines";

interface MachineAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  nextStatus: string;
  unavailableMachineIds?: string[];
  onConfirm: (machineIds: string[]) => void;
  isUpdating?: boolean;
}

export function MachineAssignmentModal({ 
  isOpen, 
  onClose, 
  order, 
  nextStatus,
  unavailableMachineIds = [],
  onConfirm,
  isUpdating 
}: MachineAssignmentModalProps) {
  const { machines, loading } = useMachines();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      setSelectedIds(order.machineIds || []);
      setError(null);
    }
  }, [isOpen, order]);

  const availableMachines = useMemo(() => {
    return machines;
  }, [machines]);

  const handleToggle = (id: string) => {
    setError(null);
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(mId => mId !== id);
      } else {
        const maxAllowed = order?.totalLoads ? Math.min(order.totalLoads, 10) : 10;
        if (prev.length >= maxAllowed) {
          setError(`Cannot assign more than ${maxAllowed} machines based on the total loads.`);
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      setError(UI_LABELS.modules.machines.ASSIGN_MODAL_ERROR_MIN);
      return;
    }
    onConfirm(selectedIds);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={UI_LABELS.modules.machines.ASSIGN_MODAL_TITLE}
      size="lg"
      className="rounded-[40px] overflow-hidden"
    >
      <div className="p-grid-6 md:p-grid-8 space-y-grid-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brand-cyan/5 blur-3xl opacity-40 pointer-events-none" />
        
        <div className="space-y-4">
          <p className="text-body-sm text-slate-500">
            {order ? `${UI_LABELS.modules.machines.ASSIGN_MODAL_DESC_PREFIX}${order.trackingNumber}${UI_LABELS.modules.machines.ASSIGN_MODAL_DESC_SUFFIX}${nextStatus}${UI_LABELS.modules.machines.ASSIGN_MODAL_DESC_SUFFIX_2}` : ''}
          </p>

          {order && order.totalLoads > 1 && selectedIds.length > 0 && (
            <div className={`p-4 rounded-xl text-sm font-bold border flex items-center gap-3 ${
              selectedIds.length === order.totalLoads 
                ? 'bg-brand-cyan/10 text-brand-cyan-dark border-brand-cyan/30' 
                : 'bg-brand-blue/10 text-brand-blue border-brand-blue/30'
            }`}>
              {selectedIds.length === order.totalLoads ? (
                <Zap className="h-5 w-5 shrink-0 text-brand-cyan-dark" />
              ) : (
                <Clock className="h-5 w-5 shrink-0 text-brand-blue" />
              )}
              <span>
                {selectedIds.length === order.totalLoads 
                  ? `Parallel Execution: Assigning ${selectedIds.length} ${selectedIds.length === 1 ? 'machine' : 'machines'} for ${order.totalLoads} loads. They will process simultaneously.` 
                  : `Sequential Execution: Assigning ${selectedIds.length} ${selectedIds.length === 1 ? 'machine' : 'machines'} for ${order.totalLoads} loads. You will need to process loads sequentially.`}
              </span>
            </div>
          )}
          
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-cyan" />
            </div>
          ) : availableMachines.length === 0 ? (
            <div className="p-6 bg-amber-50 text-amber-700 rounded-2xl flex items-center gap-4">
              <AlertCircle className="h-6 w-6" />
              <span className="font-bold">{UI_LABELS.modules.machines.ASSIGN_MODAL_NO_MACHINES}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {availableMachines.map((machine) => {
                const isSelected = selectedIds.includes(machine.id);
                // Unavailable if not operational OR if it's currently assigned to another active order.
                const isUnavailable = machine.status !== "OPERATIONAL" || (unavailableMachineIds || []).includes(machine.id);
                
                return (
                  <button
                    key={machine.id}
                    type="button"
                    disabled={isUnavailable && !isSelected}
                    onClick={() => handleToggle(machine.id)}
                    className={`
                      relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center group
                      ${isSelected 
                        ? 'border-brand-cyan bg-brand-cyan/10 shadow-md shadow-brand-cyan/20' 
                        : isUnavailable 
                          ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' 
                          : 'border-slate-200 hover:border-brand-blue/30 hover:bg-slate-50 cursor-pointer'}
                    `}
                  >
                    <div className="flex w-full items-center justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-slate-100 text-slate-400'}`}>
                        <WashingMachine className="h-5 w-5" />
                      </div>
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-brand-cyan border-brand-cyan text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 text-sm truncate w-full">
                      {machine.name}
                    </span>
                    {isUnavailable && !isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mt-1">
                        {machine.status === "OPERATIONAL" ? UI_LABELS.modules.machines.ASSIGN_MODAL_IN_USE : machine.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          {error && (
            <p className="text-rose-500 text-sm font-bold mt-2">{error}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-grid-4 pt-grid-4 border-t border-slate-100">
          <Button
            type="button"
            isLoading={isUpdating}
            onClick={handleConfirm}
            className="flex-[2] h-14 bg-brand-cyan shadow-lg shadow-brand-cyan/25 uppercase font-black text-[11px] tracking-widest active:scale-95 transition-all rounded-xl hover:bg-brand-cyan-dark"
          >
            {UI_LABELS.modules.machines.ASSIGN_MODAL_CONFIRM}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 h-14 border-slate-100 uppercase font-black text-[11px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-xl"
          >
            {UI_LABELS.shared.buttons.CANCEL}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
