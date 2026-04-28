"use client";

import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { UI_LABELS } from "@/constants/ui";

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
    <div className="relative flex items-center justify-between w-full">
      {/* Background Line */}
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-100" />
      
      {/* Progress Line */}
      <div 
        className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-brand-blue transition-all duration-500 ease-in-out shadow-[0_0_12px_rgba(21,72,157,0.2)]"
        style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
      />

      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isNext = index === currentIndex + 1;

        return (
          <div key={step.status} className="relative z-10 flex flex-col items-center group">
            <button
              onClick={() => isInteractive && onStepClick?.(step.status)}
              disabled={!isInteractive || (!isNext && !isCompleted)}
              className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                size === "xs" ? "h-4 w-4" : size === "sm" ? "h-6 w-6" : "h-9 w-9"
              } ${
                isCompleted 
                  ? "bg-brand-blue text-white border-none shadow-md shadow-brand-blue/10" 
                  : isCurrent 
                  ? "bg-white text-brand-blue ring-4 ring-brand-blue/10 shadow-lg shadow-brand-blue/20 scale-110" 
                  : isNext && isInteractive
                  ? "bg-white text-brand-blue border-2 border-brand-blue/20 hover:bg-brand-blue/5 hover:scale-105 shadow-sm"
                  : "bg-slate-50 text-slate-300 border border-slate-200"
              } ${!isInteractive ? "cursor-default" : "cursor-pointer"}`}
            >
              {isCompleted ? (
                <CheckCircle2 className={size === "xs" ? "h-2 w-2" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
              ) : isCurrent ? (
                <div className="relative">
                   <div className="absolute inset-0 bg-brand-blue rounded-full animate-ping opacity-10" />
                   {step.status === "RELEASED" ? (
                     <CheckCircle2 className={size === "xs" ? "h-2 w-2" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
                   ) : (
                     <Clock className={size === "xs" ? "h-2 w-2" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
                   )}
                </div>
              ) : (
                <div className={`rounded-full bg-current ${size === "xs" ? "h-0.5 w-0.5" : size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5"}`} />
              )}
            </button>
            
            {size === "md" && (
               <span className={`absolute -bottom-6 text-xs font-extrabold uppercase tracking-widest whitespace-nowrap transition-colors ${
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
