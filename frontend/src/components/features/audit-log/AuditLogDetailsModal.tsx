"use client";

import { motion } from "framer-motion";
import { User, Clock, Activity, ChevronRight, History, Database, ClipboardList } from "lucide-react";
import { Modal, StatusBadge } from "@/components/ui";
import { AuditLogResponse } from "@/lib/api/audit-log";
import { formatDateTime } from "@/lib/utils";
import { UI_LABELS } from "@/constants/ui";

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selected: AuditLogResponse | null;
}

/**
 * Audit Log Details Modal — Professional Administrative View (v6.0)
 * Standardized for staff readability and clean administrative transparency.
 * Removes technical fluff and ensures a stable, non-scrolling layout.
 */
export function AuditLogDetailsModal({ isOpen, onClose, selected }: AuditLogDetailsModalProps) {
  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      reference_number: UI_LABELS.shared.common.REFERENCE,
      payment_status: UI_LABELS.shared.common.STATUS,
      status: UI_LABELS.shared.common.STATUS,
      current_status: UI_LABELS.shared.common.STATUS,
      amount_paid: UI_LABELS.forms.checkout.AMOUNT,
      base_price_per_load: UI_LABELS.modules.rates.BASE_RATE,
      base_price: UI_LABELS.modules.rates.BASE_RATE,
      kg_limit_per_load: UI_LABELS.modules.rates.LOAD_CAPACITY,
      price_per_extra_minute: UI_LABELS.modules.rates.EXTRA_TIME_SURCHARGE,
      grand_total: UI_LABELS.shared.common.TOTAL,
      first_name: UI_LABELS.modules.users.FIRST_NAME,
      last_name: UI_LABELS.modules.users.LAST_NAME,
      contact_number: UI_LABELS.shared.common.CONTACT,
      is_active: UI_LABELS.shared.common.STATUS,
      role: UI_LABELS.shared.common.ROLE,
      weight_kg: UI_LABELS.modules.orders.WEIGHT,
      total_loads: UI_LABELS.modules.orders.LOADS,
    };
    return map[key.toLowerCase()] || key.replace(/_/g, ' ').toUpperCase();
  };

  const ignoredKeys = ['id', 'created_at', 'updated_at', 'password_hash', 'version', 'user_id', 'customer_id', 'service_rate_id'];

  const oldState = selected?.oldState || {};
  const newState = selected?.newState || {};

  const allKeys = Array.from(new Set([...Object.keys(oldState), ...Object.keys(newState)]))
    .filter(k => !ignoredKeys.includes(k.toLowerCase()));

  const operationColors = {
    INSERT: "text-emerald-600 bg-emerald-50 border-emerald-100",
    UPDATE: "text-amber-600 bg-amber-50 border-amber-100",
    DELETE: "text-rose-600 bg-rose-50 border-rose-100",
    USER_LOGIN: "text-blue-600 bg-blue-50 border-blue-100",
    USER_LOGOUT: "text-slate-600 bg-slate-50 border-slate-100",
    PAYMENT_RECORD: "text-emerald-600 bg-emerald-50 border-emerald-100",
    ORDER_STATUS_UPDATE: "text-blue-600 bg-blue-50 border-blue-100",
  };

  const op = selected?.operation as keyof typeof operationColors || "UPDATE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Details"
      size="lg"
      className="rounded-[32px] overflow-hidden"
    >
      <div className="p-6 md:p-8 space-y-8 max-w-full overflow-x-hidden">
        {/* ── Summary Header ── */}
        <div className="flex items-start gap-5 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
          <div className={`mt-1 h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${operationColors[op]}`}>
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Overview</p>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-bold text-slate-900 leading-tight truncate">
                {UI_LABELS.modules.auditLog.ACTION_MAP[selected?.operation || ''] || selected?.operation}
              </h4>
              <span className="text-slate-300">•</span>
              <span className="text-body-sm font-semibold text-brand-blue">
                {UI_LABELS.modules.auditLog.TABLE_MAP[selected?.entityType || ''] || selected?.entityType}
              </span>
              {selected?.entityId && selected.entityId !== "N/A" && (
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">
                  ID: {selected?.entityId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── State Comparison ── */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-6 px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <History className="h-3.5 w-3.5" />
              Previous State
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-blue">
              <Activity className="h-3.5 w-3.5" />
              New State
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              {allKeys.length === 0 ? (
                <div className="py-12 px-6 text-center space-y-3">
                  <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                    <Database className="h-6 w-6 text-slate-200" />
                  </div>
                  <p className="text-body-sm font-medium text-slate-400">No specific field changes recorded for this activity.</p>
                </div>
              ) : (
                allKeys.map((key) => {
                  const oldVal = oldState[key];
                  const newVal = newState[key];
                  const hasChanged = oldVal !== newVal;

                  const isStatus = key.toLowerCase().includes('status');
                  const isActive = key.toLowerCase().includes('active');

                  return (
                    <div
                      key={key}
                      className={`grid grid-cols-2 gap-6 px-6 py-4 items-center ${hasChanged ? 'bg-brand-blue/[0.01]' : ''}`}
                    >
                      {/* Previous */}
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">
                          {getLabel(key)}
                        </p>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-slate-200 shrink-0" />
                          <div className="truncate">
                            {isStatus || isActive ? (
                              <StatusBadge
                                variant="neutral"
                                label={oldVal !== undefined && oldVal !== null ? String(oldVal) : '---'}
                                className="scale-75 origin-left opacity-50"
                              />
                            ) : (
                              <span className="text-body-sm font-medium text-slate-400/70 line-through">
                                {oldVal !== undefined && oldVal !== null ? String(oldVal) : '---'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* New */}
                      <div className="min-w-0 border-l border-slate-50 pl-6">
                        <div className="h-4" /> {/* Spacer */}
                        <div className="truncate">
                          {isStatus || isActive ? (
                            <StatusBadge
                              variant={String(newVal).toUpperCase() === 'PAID' || newVal === true || String(newVal).toUpperCase() === 'READY_FOR_PICKUP' ? "success" : "neutral"}
                              label={newVal !== undefined && newVal !== null ? String(newVal) : '---'}
                              className="scale-75 origin-left"
                            />
                          ) : (
                            <span className={`text-body-sm font-bold ${hasChanged ? 'text-brand-blue' : 'text-slate-600'}`}>
                              {newVal !== undefined && newVal !== null ? String(newVal) : '---'}
                              {hasChanged && oldVal !== undefined && (
                                <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-brand-blue shrink-0" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Metadata Footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Performed By</p>
                <p className="text-body-sm font-bold text-slate-700">
                  {!selected?.actor || selected.actor === "Unknown" || selected.actor === "anonymous" ? "System" : selected.actor}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Timestamp</p>
                <p className="text-body-sm font-bold text-slate-700">{selected?.createdAt ? formatDateTime(selected.createdAt) : "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
