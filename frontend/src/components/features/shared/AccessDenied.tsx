import { ShieldAlert } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="p-8 rounded-3xl bg-error-700/10 border border-error-700/20 shadow-2xl shadow-error-700/5 relative group">
        <div className="absolute inset-0 bg-error-700/20 blur-2xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
        <ShieldAlert className="h-20 w-20 text-error-700 relative z-10" />
      </div>
      <div className="space-y-3 px-6">
        <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">{UI_LABELS.feedback.error.ACCESS_DENIED_TITLE}</h2>
        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
          {UI_LABELS.feedback.error.ACCESS_DENIED_DESC}
        </p>
      </div>
    </div>
  );
}
