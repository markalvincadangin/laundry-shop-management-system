"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Clock } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
] as const;

/**
 * InactivityOverlay — T010
 * Renders a full-screen privacy overlay after 5 minutes of no user interaction.
 * Dismisses on any user activity or via the explicit "Resume Session" button.
 *
 * Mount once inside the DashboardLayout root container.
 * Architecture: component-only, no routing imports (Constitution Principle II).
 */
export function InactivityOverlay() {
  const [isIdle, setIsIdle] = useState(false);

  const resetTimer = useCallback(() => {
    // Dispatching a synthetic activity event ensures the useEffect's
    // handleActivity runs, which does setIsIdle(false) AND reschedules
    // the 5-minute countdown. This makes dismiss + re-trigger work correctly.
    document.dispatchEvent(new MouseEvent("mousemove"));
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const scheduleTimeout = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsIdle(true);
      }, INACTIVITY_TIMEOUT_MS);
    };

    const handleActivity = () => {
      setIsIdle(false);
      scheduleTimeout();
    };

    // Start the initial timer
    scheduleTimeout();

    // Register all activity listeners on the document
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          key="inactivity-overlay"
          data-testid="inactivity-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={resetTimer}
        >
          {/* Backdrop — blur + dark tint to obscure customer data */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center gap-8 rounded-[2rem] border border-white/10 bg-slate-800/90 backdrop-blur-2xl p-12 shadow-2xl max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="relative flex items-center justify-center h-20 w-20">
              <span className="absolute inset-0 rounded-full bg-brand-blue/10 animate-ping opacity-30" />
              <div className="relative h-20 w-20 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                <ShieldCheck className="h-9 w-9 text-brand-blue" />
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                {UI_LABELS.feedback.inactivity.TITLE}
              </h2>
              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                {UI_LABELS.feedback.inactivity.DESC}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              data-testid="inactivity-dismiss-btn"
              onClick={resetTimer}
              className="flex items-center gap-2 h-12 px-8 rounded-xl bg-brand-blue text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/30 hover:bg-brand-blue/90 active:scale-95 transition-all"
            >
              <Clock className="h-4 w-4" />
              {UI_LABELS.feedback.inactivity.DISMISS_BTN}
            </button>

            {/* Hint */}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {UI_LABELS.feedback.inactivity.DISMISS}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
