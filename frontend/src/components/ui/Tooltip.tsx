"use client";

import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

/**
 * Tooltip — v1.0
 * Lightweight, logic-driven tooltip for collapsed sidebar icons.
 * FRONT-001 §1.1 (Cognitive Load reduction).
 */
export function Tooltip({ content, children, position = "right", disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled) return <>{children}</>;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[500] pointer-events-none ${positionClasses[position]}`}>
          <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
            {content}
            {/* Arrow */}
            <div className={`absolute w-1.5 h-1.5 bg-slate-900 rotate-45 ${
              position === "right" ? "-left-0.5 top-1/2 -translate-y-1/2" : ""
            }`} />
          </div>
        </div>
      )}
    </div>
  );
}
