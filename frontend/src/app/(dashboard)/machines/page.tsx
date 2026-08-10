"use client";

import React, { useState } from "react";
import { Server, Plus, Trash2, Settings2, ShieldCheck, Wrench, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/stores/auth-store";
import { PageHeader } from "@/components/layout";
import { Button, StatusBadge, ConfirmDialog, TableSkeleton } from "@/components/ui";
import { DataTable, AccessDenied } from "@/features/shared";
import { useMachines } from "@/hooks/useMachines";
import { MachineResponse } from "@/lib/api/machines";
import { DataTableColumn } from "@/types/components";
import { MachineModal } from "@/components/features/machines/MachineModal";
import { formatDate } from "@/lib/utils";
import { UI_LABELS } from "@/constants/ui";

export default function MachinesPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { machines, loading, refresh, removeMachine } = useMachines();
  const [selectedMachine, setSelectedMachine] = useState<MachineResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteMachine, setConfirmDeleteMachine] = useState<MachineResponse | null>(null);

  if (authLoading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
        <PageHeader title={UI_LABELS.modules.machines.TITLE} subtitle={UI_LABELS.modules.machines.SUBTITLE} icon={Server} />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (currentUser?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  const handleEdit = (machine: MachineResponse) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedMachine(null);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteMachine) {
      removeMachine(confirmDeleteMachine.id);
      setConfirmDeleteMachine(null);
    }
  };

  const columns: DataTableColumn<MachineResponse>[] = [
    {
      header: UI_LABELS.modules.machines.FORM_NAME_LABEL,
      sortable: true,
      sortKey: "name",
      render: (m) => (
        <div className="flex items-center gap-grid-4 group">
          <div className="h-10 w-10 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center">
            <Server className="h-5 w-5 text-brand-blue" />
          </div>
          <span className="text-body-sm font-black text-slate-900">{m.name}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.modules.machines.FORM_STATUS_LABEL,
      sortable: true,
      sortKey: "status",
      render: (m) => {
        let variant: any = "success";
        let icon = ShieldCheck;
        let label: string = UI_LABELS.modules.machines.STATUS_OPERATIONAL;
        if (m.status === "MAINTENANCE") {
          variant = "warning";
          icon = Wrench;
          label = UI_LABELS.modules.machines.STATUS_MAINTENANCE;
        } else if (m.status === "OUT_OF_ORDER") {
          variant = "destructive";
          icon = ShieldAlert;
          label = UI_LABELS.modules.machines.STATUS_OUT_OF_ORDER;
        }
        return <StatusBadge variant={variant} label={label} icon={icon} />;
      },
    },
    {
      header: UI_LABELS.modules.machines.TABLE_CREATED_AT,
      sortable: true,
      sortKey: "createdAt",
      render: (m) => (
        <span className="text-body-sm text-slate-600 font-bold">{formatDate(m.createdAt)}</span>
      ),
    },
    {
      header: UI_LABELS.modules.machines.TABLE_ACTIONS,
      align: "right",
      render: (m) => (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="xs" onClick={() => handleEdit(m)} className="text-slate-400 hover:text-brand-blue">
            <Settings2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-slate-100 mx-3" />
          <Button variant="ghost" size="xs" onClick={() => setConfirmDeleteMachine(m)} className="text-rose-400 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-grid-12 pb-grid-20 px-4 xl:px-0">
      <PageHeader
        variant="premium"
        title={UI_LABELS.modules.machines.TITLE}
        subtitle={UI_LABELS.modules.machines.SUBTITLE}
        icon={Server}
        actions={
          <Button onClick={handleCreate} className="h-14 px-grid-8 gap-grid-3 bg-brand-blue text-white shadow-lg uppercase font-black text-caption rounded-xl">
            <Plus className="h-5 w-5" />
            {UI_LABELS.modules.machines.ADD_MACHINE}
          </Button>
        }
      />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-grid-6">
        <DataTable
          data={machines}
          columns={columns}
          loading={loading}
          mobileCardRender={(m) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{m.name}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  m.status === "OPERATIONAL" ? "bg-emerald-50 text-emerald-700" :
                  m.status === "MAINTENANCE" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Created: {formatDate(m.createdAt)}</span>
                <span className="text-[11px] font-semibold text-slate-400">Tap to edit →</span>
              </div>
            </div>
          )}
        />
      </motion.div>

      <MachineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} machine={selectedMachine} onSuccess={() => refresh()} />

      <ConfirmDialog
        isOpen={!!confirmDeleteMachine}
        title={UI_LABELS.modules.machines.CONFIRM_DELETE_TITLE}
        description={UI_LABELS.modules.machines.CONFIRM_DELETE_DESC}
        confirmText={UI_LABELS.shared.buttons.DELETE}
        isDestructive={true}
        icon={Trash2}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteMachine(null)}
      />
    </div>
  );
}
