import { Database, User, Clock, ShieldCheck, Activity, Terminal } from "lucide-react";
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

  // Helper to map DB keys to human labels
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
      className="rounded-[32px]"
    >
      <div className="p-grid-6 md:p-grid-8 space-y-grid-8">
        {/* ── Inspection Header ── */}
        <div className="flex items-center gap-grid-6 p-grid-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-all ${operationColors[op]}`}>
            <Database className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {UI_LABELS.modules.auditLog.AUDIT_RECORD}
            </p>
            <h4 className="text-h4 font-black text-slate-900 tracking-tight flex items-baseline gap-2 flex-wrap">
              {UI_LABELS.modules.auditLog.ACTION_MAP[selected?.operation || ''] || selected?.operation} 
              <span className="text-brand-blue">{UI_LABELS.modules.auditLog.TABLE_MAP[selected?.entityType || ''] || selected?.entityType}</span>
              <span className="text-xs font-mono text-slate-400 font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                #{selected?.entityId}
              </span>
            </h4>
          </div>
        </div>

        {/* ── Forensic Data Snapshot ── */}
        <div className="space-y-grid-3">
          <div className="flex items-center justify-between px-grid-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {UI_LABELS.modules.auditLog.NEW_DATA}
            </label>
            <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/5 px-2 py-0.5 rounded-full">
              Post-Mutation State
            </span>
          </div>
          
          <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
              {snapshotKeys.length === 0 ? (
                <div className="p-grid-10 text-center space-y-grid-2">
                  <Activity className="h-10 w-10 text-slate-100 mx-auto" />
                  <p className="text-body-sm font-bold text-slate-300 italic">No snapshot data available.</p>
                </div>
              ) : (
                snapshotKeys.map((key, i) => {
                  const val = snapshotObj[key];
                  const isStatus = key.toLowerCase().includes('status');
                  const isActive = key.toLowerCase().includes('active');

                  return (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center px-grid-5 py-grid-4 hover:bg-slate-50/50 transition-colors">
                      <div className="w-full sm:w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        {getLabel(key)}
                      </div>
                      <div className="w-full sm:w-2/3 mt-1 sm:mt-0">
                        {isStatus || isActive ? (
                          <StatusBadge 
                            variant={String(val).toUpperCase() === 'PAID' || val === true ? "success" : "neutral"} 
                            label={String(val)} 
                            className="scale-90 origin-left"
                          />
                        ) : (
                          <span className="text-body-sm font-bold text-slate-700 break-all">
                            {val !== undefined && val !== null ? String(val) : '---'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Metadata & Operator ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-6 pt-grid-6 border-t border-slate-100">
          <div className="space-y-grid-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                <User className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{UI_LABELS.modules.auditLog.OPERATOR}</span>
                <span className="text-body-sm font-bold text-slate-900">{selected?.actor || "Automated System"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                <Clock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{UI_LABELS.shared.common.TIME}</span>
                <span className="text-body-sm font-bold text-slate-900">{selected?.createdAt ? formatDateTime(selected.createdAt) : "—"}</span>
              </div>
            </div>
          </div>

          {(selected?.methodName || selected?.description) && (
            <div className="p-grid-5 rounded-2xl bg-slate-900 text-slate-50 space-y-grid-4 shadow-xl">
              <div className="flex items-center gap-2 text-brand-blue">
                <Terminal className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{UI_LABELS.modules.auditLog.AUDIT_METADATA}</span>
              </div>
              
              {selected?.methodName && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{UI_LABELS.shared.common.METHOD}</span>
                  <code className="text-xs font-mono text-emerald-400 break-all bg-slate-800/50 px-1.5 py-0.5 rounded">
                    {selected?.methodName}
                  </code>
                </div>
              )}
              {selected?.description && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{UI_LABELS.shared.common.DETAILS}</span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">{selected?.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
