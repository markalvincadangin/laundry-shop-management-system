"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth, useRequireAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/features/shared";

/**
 * AuthGuard Component
 * Structural wrapper for authenticated routes.
 * Mandated by FRONT-002 §8.12.
 * Shows LoadingState while session is initializing to prevent layout flashing.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, user } = useAuth();
  
  // Initialize redirect logic
  useRequireAuth(pathname);
  
  // Public paths don't need the guard (though usually handled by layout split)
  const isPublicPath = ["/login", "/track"].some(p => pathname.startsWith(p));

  // While loading session or redirecting, show forensic loading state
  if ((loading || !user) && !isPublicPath) {
    return <LoadingState fullPage />;
  }

  return <>{children}</>;
}
