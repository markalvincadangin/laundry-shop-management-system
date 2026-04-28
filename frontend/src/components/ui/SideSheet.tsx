"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

/**
 * Shared SideSheet Atom (Drawer)
 * Adheres to HCI Progressive Disclosure and Context Preservation principles.
 * Integrated with React Portal to ensure visibility above all layout containers.
 */
export function SideSheet({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: SideSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div 
          className={`
            w-screen ${width} transform transition-transform 
            animate-in slide-in-from-right duration-300
            bg-white shadow-2xl flex flex-col relative z-10
          `}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            {title && (
              <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
