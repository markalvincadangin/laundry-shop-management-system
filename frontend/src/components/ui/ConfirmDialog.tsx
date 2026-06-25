"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { ConfirmDialogProps } from "@/types/components";

/**
 * ConfirmDialog — High-Fidelity Guardrail (v4.0)
 * Standardized confirmation modal for destructive or sensitive actions.
 * Adheres to FRONT-001 §1.6 (Error Prevention and Recovery).
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Back",
  onConfirm,
  onCancel,
  isLoading = false,
  isDestructive = false,
  icon: Icon,
  children,
}: ConfirmDialogProps) {
  // Default icons based on destructiveness
  const DisplayIcon = Icon || (isDestructive ? ShieldAlert : AlertTriangle);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel} 
      title={title}
      size="md"
      className="rounded-3xl shadow-2xl"
    >
      <div className="p-grid-6 md:p-grid-8 space-y-grid-8">
        <div className="flex flex-col items-center text-center space-y-grid-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 shadow-inner transition-all ${
            isDestructive 
              ? "bg-error-50 border-error-100 text-error-500" 
              : "bg-brand-blue/5 border-brand-blue/10 text-brand-blue"
          }`}>
            <DisplayIcon className="h-8 w-8" strokeWidth={2.5} />
          </div>
          
          <div className="space-y-grid-2">
            <h3 className="text-h3 font-black text-slate-900 uppercase tracking-tight">
              {title}
            </h3>
            <p className="text-body-sm text-slate-500 leading-relaxed max-w-[280px] mx-auto">
              {description}
            </p>
          </div>
          
          {children && (
            <div className="w-full mt-grid-4 p-grid-4 rounded-xl bg-slate-50 border border-slate-100 shadow-inner">
              {children}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-grid-3 pt-grid-2">
          <Button
            variant="ghost"
            className="flex-1 font-black uppercase text-[10px] tracking-widest h-13 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            className={`flex-1 font-black uppercase text-[10px] tracking-widest h-13 rounded-xl shadow-lg transition-all active:scale-95 ${
              isDestructive 
                ? "bg-error-500 hover:bg-error-600 shadow-error-500/20" 
                : "bg-brand-blue hover:bg-brand-blue/90 shadow-brand-blue/20"
            }`}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
