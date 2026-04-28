import React from "react";

import { AvatarProps } from "@/types/components";

/**
 * Standardized Avatar Atom
 * Adheres to FRONT-001 §5.2 (Consistent Visual Language)
 */
export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    sm: "h-grid-8 w-grid-8",
    md: "h-grid-10 w-grid-10",
    lg: "h-grid-14 w-grid-14",
  };

  return (
    <div 
      className={`
        ${sizes[size]} 
        rounded-xl bg-gradient-to-br from-brand-blue to-blue-600 
        flex items-center justify-center shadow-lg ring-1 ring-white/10 shrink-0
        ${className}
      `}
    >
      <span className="text-white text-caption font-black tracking-widest">{initials}</span>
    </div>
  );
}
