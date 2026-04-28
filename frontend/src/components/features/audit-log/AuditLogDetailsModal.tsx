import { Database, User, Clock } from "lucide-react";
import { Modal, StatusBadge } from "@/components/ui";
import { AuditLogResponse } from "@/services/audit-log.service";
import { formatDateTime } from "@/lib/utils";
import { UI_LABELS } from "@/constants/ui";

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selected: AuditLogResponse | null;
}

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={UI_LABELS.modules.auditLog.AUDIT_INSPECTION}
      size="lg"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${selected?.operation === 'INSERT' ? 'bg-emerald-100 text-emerald-700' :
              selected?.operation === 'UPDATE' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
            }`}>
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-slate-500">{UI_LABELS.modules.auditLog.AUDIT_RECORD}</p>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5">
              {UI_LABELS.modules.auditLog.ACTION_MAP[selected?.operation || ''] || selected?.operation} {UI_LABELS.modules.auditLog.TABLE_MAP[selected?.entityType || ''] || selected?.entityType} <span className="font-mono text-slate-400 font-medium ml-1">#{selected?.entityId}</span>
            </h4>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-semibold uppercase tracking-widest text-slate-500 px-1">
            {UI_LABELS.modules.auditLog.NEW_DATA}
          </label>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white max-h-[400px] overflow-y-auto shadow-sm">
            {snapshotKeys.length === 0 ? (
              <div className="p-4 text-center text-sm font-medium text-slate-400 italic">No snapshot data available.</div>
            ) : (
              snapshotKeys.map((key, i) => {
                const val = snapshotObj[key];
                return (
                  <div key={key} className={`flex flex-col sm:flex-row sm:items-center px-4 py-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                    <div className="w-full sm:w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-0 break-words pr-4">
                      {getLabel(key)}
                    </div>
                    <div className="w-full sm:w-2/3 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {val !== undefined && val !== null ? String(val) : '---'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-[13px] font-medium">{UI_LABELS.modules.auditLog.OPERATOR}: <span className="font-bold text-slate-800">{selected?.actor || "System"}</span></span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-[13px] font-medium">{formatDateTime(selected?.createdAt)}</span>
          </div>
        </div>

        {/* Audit Metadata */}
        {(selected?.methodName || selected?.description) && (
          <div className="pt-6 border-t border-slate-100">
            <label className="text-[12px] font-semibold uppercase tracking-widest text-slate-500 px-1 mb-2 block">
              {UI_LABELS.modules.auditLog.AUDIT_METADATA}
            </label>
            <div className="grid grid-cols-1 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              {selected?.methodName && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{UI_LABELS.shared.common.METHOD}</span>
                  <span className="text-xs font-mono text-slate-600 break-all">{selected?.methodName}</span>
                </div>
              )}
              {selected?.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{UI_LABELS.shared.common.DETAILS}</span>
                  <span className="text-xs text-slate-600 leading-relaxed">{selected?.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
