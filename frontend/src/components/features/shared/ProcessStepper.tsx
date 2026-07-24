"use client";

import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";
import { motion } from "framer-motion";

type OrderStatus = "RECEIVED" | "WASHING" | "DRYING" | "FOLDING" | "READY_FOR_PICKUP" | "RELEASED" | "CANCELLED";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "RECEIVED", label: UI_LABELS.shared.status.RECEIVED },
  { status: "WASHING", label: UI_LABELS.shared.status.WASHING },
  { status: "DRYING", label: UI_LABELS.shared.status.DRYING },
  { status: "FOLDING", label: UI_LABELS.shared.status.FOLDING },
  { status: "READY_FOR_PICKUP", label: UI_LABELS.shared.status.READY_FOR_PICKUP },
  { status: "RELEASED", label: UI_LABELS.shared.status.RELEASED },
];

import type { ProcessStepperProps } from "@/types/components";

export function ProcessStepper({ 
  currentStatus, 
  size = "md", 
  onStepClick,
  isInteractive = false 
}: ProcessStepperProps) {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest">
        <Circle className="h-4 w-4 fill-rose-600/10" />
        {UI_LABELS.shared.status.CANCELLED}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="relative flex items-center justify-between w-full h-12">
      {/* Background Line */}
      <div data-testid="stepper-bg-line" className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-100" />
      
      {/* Progress Line */}
      <motion.div 
        className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-brand-blue shadow-[0_0_12px_rgba(21,72,157,0.2)]"
        initial={{ width: 0 }}
        animate={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        transition={{ duration: 0.8, ease: "circOut" }}
        data-testid="stepper-progress-line"
      />

      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isNext = index === currentIndex + 1;

        return (
          <div key={step.status} className="relative z-10 flex flex-col items-center group">
            <motion.button
              whileHover={isInteractive && (isNext || isCompleted) ? { scale: 1.1 } : {}}
              whileTap={isInteractive && (isNext || isCompleted) ? { scale: 0.95 } : {}}
              onClick={() => isInteractive && onStepClick?.(step.status)}
              disabled={!isInteractive || (!isNext && !isCompleted)}
              className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                size === "xs" ? "h-4 w-4" : size === "sm" ? "h-6 w-6" : "h-9 w-9"
              } ${
                isCompleted 
                  ? "bg-brand-blue text-white border-none shadow-md shadow-brand-blue/10" 
                  : isCurrent 
                  ? "bg-white text-brand-blue ring-4 ring-brand-blue/10 shadow-lg shadow-brand-blue/20" 
                  : isNext && isInteractive
                  ? "bg-white text-brand-blue border-2 border-brand-blue/20 shadow-sm"
                  : "bg-slate-50 text-slate-300 border border-slate-200"
              } ${!isInteractive ? "cursor-default" : "cursor-pointer"}`}
            >
              {isCompleted ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle2 className={size === "xs" ? "h-2 w-2" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </motion.div>
              ) : isCurrent ? (
                <div className="relative">
                   {step.status !== "RELEASED" && (
                     <div className="absolute inset-0 bg-brand-blue rounded-full animate-ping opacity-10" />
                   )}
                   {step.status === "RELEASED" ? (
                     <CheckCircle2 className={size === "xs" ? "h-2 w-2" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
                   ) : (
                     <Clock className={size === "xs" ? "h-2 w-2" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
                   )}
                </div>
              ) : (
                <div className={`rounded-full bg-current ${size === "xs" ? "h-0.5 w-0.5" : size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5"}`} />
              )}
            </motion.button>
            
            {size === "md" && (
               <span className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                 isCurrent ? "text-brand-blue" : isNext && isInteractive ? "text-brand-blue/60" : "text-slate-400"
               }`}>
                 {step.label}
               </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
