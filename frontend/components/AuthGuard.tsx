"use client";

import { usePathname } from "next/navigation";
import { useRequireAuth } from "@/contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useRequireAuth(pathname);
  return <>{children}</>;
}
