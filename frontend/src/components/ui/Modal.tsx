"use client";

import React, { useEffect } from "react";
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] h-[90vh]",
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Container */}
      <div 
        className={`
          relative z-10 w-full transform overflow-hidden rounded-3xl 
          bg-white border border-slate-200 shadow-2xl transition-all 
          animate-in zoom-in-95 fade-in duration-300
          ${sizes[size]}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white/[0.02]">
            {title && (
              <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
