"use client";

import * as React from "react";
import { Button, Modal } from "@/components/ui";

import { ConfirmDialogProps } from "@/types/components";

/**
 * Standardized Confirmation Dialog
 * Adheres to FRONT-001 §1.6 (Error Prevention and Recovery)
 * Rebuilt using the shared Modal primitive.
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
  children,
}: ConfirmDialogProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel} 
      title={title}
      size="md"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {description}
          </p>
          {children && <div className="mt-4">{children}</div>}
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
          <Button
            variant={isDestructive ? "danger" : "primary"}
            className={`flex-1 font-bold uppercase text-[11px] tracking-widest h-12 ${!isDestructive ? 'shadow-lg shadow-brand-cyan/20' : ''}`}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
          <Button
            variant="outline"
            className="flex-1 font-bold uppercase text-[11px] tracking-widest h-12"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
