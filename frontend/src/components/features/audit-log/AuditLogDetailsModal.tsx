"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Database, User, Clock, ShieldCheck, Activity, Terminal, ChevronRight, Fingerprint } from "lucide-react";
import { Modal, StatusBadge } from "@/components/ui";
import { AuditLogResponse } from "@/services/audit-log.service";
import { formatDateTime } from "@/lib/utils";
import { UI_LABELS } from "@/constants/ui";

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selected: AuditLogResponse | null;
}

/**
 * Audit Log Details Modal — High Fidelity (v4.0)
 * Provides a granular forensic inspection of system-wide entity mutations.
 * Standardized with FRONT-001 §11.4 standards.
 */
export function AuditLogDetailsModal({ isOpen, onClose, selected }: AuditLogDetailsModalProps) {
  const parseSnapshot = (snapshot: string | undefined | null) => {
    if (!snapshot) return {};
    try {
      return JSON.parse(snapshot);
    } catch {
      return { raw: snapshot };
    }
  };

  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      reference_number: UI_LABELS.shared.common.REFERENCE,
      payment_status: UI_LABELS.shared.common.STATUS,
      status: UI_LABELS.shared.common.STATUS,
      amount_paid: UI_LABELS.forms.checkout.AMOUNT,
      base_price_per_load: UI_LABELS.modules.rates.BASE_PRICE,
      kg_limit_per_load: UI_LABELS.modules.rates.KG_CAPACITY,
      price_per_extra_minute: UI_LABELS.modules.rates.EXTRA_SURCHARGE,
      grand_total: UI_LABELS.shared.common.TOTAL,
      first_name: UI_LABELS.modules.users.FIRST_NAME,
      last_name: UI_LABELS.modules.users.LAST_NAME,
      contact_number: UI_LABELS.shared.common.CONTACT,
      is_active: UI_LABELS.shared.common.STATUS,
      role: UI_LABELS.shared.common.ROLE,
    };
    return map[key.toLowerCase()] || key.replace(/_/g, ' ').toUpperCase();
  };

  const snapshotObj = parseSnapshot(selected?.snapshot);
  const snapshotKeys = Object.keys(snapshotObj).filter(k => !['id', 'created_at', 'updated_at', 'password_hash'].includes(k.toLowerCase()));

  const operationColors = {
    INSERT: "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-500/10",
    UPDATE: "bg-amber-50 border-amber-100 text-amber-600 shadow-amber-500/10",
    DELETE: "bg-rose-50 border-rose-100 text-rose-600 shadow-rose-500/10",
  };

  const op = selected?.operation as keyof typeof operationColors || "UPDATE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={UI_LABELS.modules.auditLog.AUDIT_INSPECTION}
      size="lg"
      className="rounded-[40px] overflow-hidden"
    >
      <div className="p-grid-6 md:p-grid-8 space-y-grid-8 relative">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl opacity-40 pointer-events-none" />

        {/* ── Inspection Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-grid-6 p-grid-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner relative z-10"
        >
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-all ${operationColors[op]}`}>
            <Fingerprint className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {UI_LABELS.modules.auditLog.AUDIT_RECORD}
            </p>
            <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-baseline gap-2 flex-wrap">
              {UI_LABELS.modules.auditLog.ACTION_MAP[selected?.operation || ''] || selected?.operation} 
              <span className="text-brand-blue">{UI_LABELS.modules.auditLog.TABLE_MAP[selected?.entityType || ''] || selected?.entityType}</span>
              <span className="text-xs font-mono text-slate-400 font-black bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                #{selected?.entityId}
              </span>
            </h4>
          </div>
        </motion.div>

        {/* ── Forensic Data Snapshot ── */}
        <div className="space-y-grid-4">
          <div className="flex items-center justify-between px-grid-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Activity className="h-3 w-3 text-brand-blue" />
              {UI_LABELS.modules.auditLog.NEW_DATA}
            </label>
            <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/5 border border-brand-blue/10 px-3 py-1 rounded-full shadow-sm">
              Post-Mutation State
            </span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-[32px] border border-slate-200/60 overflow-hidden bg-white shadow-xl shadow-slate-200/20"
          >
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
              {snapshotKeys.length === 0 ? (
                <div className="p-grid-12 text-center space-y-grid-4">
                  <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100 border-dashed">
                    <Database className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-body-sm font-black text-slate-300 uppercase tracking-widest">No mutation data available</p>
                </div>
              ) : (
                snapshotKeys.map((key, i) => {
                  const val = snapshotObj[key];
                  const isStatus = key.toLowerCase().includes('status');
                  const isActive = key.toLowerCase().includes('active');

                  return (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex flex-col sm:flex-row sm:items-center px-grid-6 py-grid-5 hover:bg-slate-50/50 transition-colors group"
                    >
                      <div className="w-full sm:w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-brand-blue transition-colors">
                        <ChevronRight className="h-3 w-3 opacity-30" />
                        {getLabel(key)}
                      </div>
                      <div className="w-full sm:w-2/3 mt-2 sm:mt-0">
                        {isStatus || isActive ? (
                          <StatusBadge 
                            variant={String(val).toUpperCase() === 'PAID' || val === true ? "success" : "neutral"} 
                            label={String(val)} 
                            className="scale-90 origin-left"
                          />
                        ) : (
                          <span className="text-body-sm font-bold text-slate-700 break-all bg-slate-50/50 px-2 py-1 rounded-md border border-transparent group-hover:border-slate-100 group-hover:bg-white transition-all">
                            {val !== undefined && val !== null ? String(val) : '---'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Metadata & Operator ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6 pt-grid-6 border-t border-slate-100 relative z-10">
          <div className="space-y-grid-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm text-brand-blue">
                <User className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{UI_LABELS.modules.auditLog.OPERATOR}</span>
                <span className="text-body-sm font-black text-slate-900">{selected?.actor || "Automated System"}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm text-slate-400">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{UI_LABELS.shared.common.TIME}</span>
                <span className="text-body-sm font-black text-slate-900">{selected?.createdAt ? formatDateTime(selected.createdAt) : "—"}</span>
              </div>
            </div>
          </div>

          {(selected?.methodName || selected?.description) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-grid-6 rounded-[32px] bg-slate-900 text-slate-50 space-y-grid-4 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-brand-blue/10 blur-2xl" />
              
              <div className="flex items-center gap-2 text-brand-blue relative z-10">
                <Terminal className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{UI_LABELS.modules.auditLog.AUDIT_METADATA}</span>
              </div>
              
              <div className="space-y-4 relative z-10">
                {selected?.methodName && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{UI_LABELS.shared.common.METHOD}</span>
                    <code className="text-xs font-mono text-emerald-400 break-all bg-white/5 border border-white/10 px-3 py-2 rounded-xl block shadow-inner">
                      {selected?.methodName}
                    </code>
                  </div>
                )}
                {selected?.description && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{UI_LABELS.shared.common.DETAILS}</span>
                    <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-brand-blue/30 pl-3">{selected?.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
}
