"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ModalProps } from "@/types/components";

/**
 * Shared Modal Atom
 * Provides the foundational backdrop and glass container for all dialogs.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] h-[90vh]",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Backdrop — FRONT-001 §2.4.2 */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[16px] transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Container — FRONT-001 §2.4.1 (radius-lg = 12px/rounded-xl) */}
      <div 
        className={`
          relative z-10 w-full transform overflow-hidden rounded-xl 
          bg-white border border-slate-200 shadow-2xl transition-all 
          animate-in zoom-in-95 fade-in duration-300
          ${sizes[size]}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header — space-4 padding */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-neutral-50/50">
            {title && (
              <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
