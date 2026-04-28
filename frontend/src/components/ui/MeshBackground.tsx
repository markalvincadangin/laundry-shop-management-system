import React from "react";

/**
 * Standardized Mesh Background Atom
 * Provides the signature blurred ambient lighting for glassmorphic interfaces.
 */
export function MeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-brand-blue/5 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-brand-cyan/5 rounded-full blur-[150px] animate-pulse-slow-reverse" />
    </div>
  );
}
