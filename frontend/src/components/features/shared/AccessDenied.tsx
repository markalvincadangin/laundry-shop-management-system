import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UI_LABELS } from "@/constants/ui";
import { Button } from "@/components/ui";

/**
 * AccessDenied — High-Fidelity Restricted State (v4.0)
 * Displayed when a user attempts to access a page above their RBAC level.
 */
export function AccessDenied() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-grid-20 text-center px-grid-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-grid-10"
      >
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-error-500/20 blur-3xl rounded-full opacity-40 animate-pulse" />

        <div className="relative p-grid-10 rounded-[40px] bg-white border border-error-100 shadow-2xl shadow-error-500/10 ring-1 ring-error-50/50">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-error-50 border border-error-100 shadow-inner">
            <ShieldAlert className="h-12 w-12 text-error-600" strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-grid-4 max-w-md"
      >
        <div className="space-y-grid-2">
          <h2 className="text-h2 md:text-display font-black text-slate-900 tracking-tight uppercase">
            {UI_LABELS.feedback.error.ACCESS_DENIED_TITLE}
          </h2>
          <div className="h-1.5 w-16 bg-error-500 mx-auto rounded-full" />
        </div>

        <p className="text-body-md font-medium text-slate-500 leading-relaxed">
          {UI_LABELS.feedback.error.ACCESS_DENIED_DESC}
        </p>

        <div className="pt-grid-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="h-14 px-grid-10 gap-grid-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            {UI_LABELS.shared.buttons.BACK}
          </Button>
        </div>
      </motion.div>

      {/* Forensic Meta */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.8 }}
        className="mt-grid-20 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]"
      >
        System Security: All access attempts are logged for audit purposes.
      </motion.p>
    </div>
  );
}
