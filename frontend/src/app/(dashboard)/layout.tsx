"use client";

import { Suspense } from "react";
import { Sidebar, MobileNav, AuthGuard, Topbar } from "@/components/layout";
import { LoadingState } from "@/features/shared";
import { MeshBackground } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { usePathname } from "next/navigation";
import { useLayout } from "@/contexts/LayoutContext";

/**
 * DashboardLayout — v3.2
 * Standardized shell for the Faith Laundry Command Center.
 * Supports collapsible sidebar for maximized horizontal workspace.
 */
const PAGE_TITLES: Record<string, string> = {
  "/overview": UI_LABELS.modules.dashboard.TITLE,
  "/orders": UI_LABELS.layout.nav.ORDERS,
  "/customers": UI_LABELS.layout.nav.CUSTOMERS,
  "/payments": UI_LABELS.layout.nav.PAYMENTS,
  "/reports": UI_LABELS.layout.nav.REPORTS,
  "/rates": UI_LABELS.layout.nav.RATES,
  "/users": UI_LABELS.layout.nav.USERS,
  "/messaging": UI_LABELS.modules.clientAlerts.TITLE,
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for nested routes
  const match = Object.keys(PAGE_TITLES).find(
    (key) => key !== "/" && pathname.startsWith(key)
  );
  return match ? PAGE_TITLES[match] : UI_LABELS.modules.dashboard.TITLE;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useLayout();
  const title = getPageTitle(pathname ?? "/");

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-neutral-50 transition-all duration-300">
      {/* Mesh Background for Glassmorphism */}
      <MeshBackground />

      {/* Desktop Sidebar — fixed left */}
      <Sidebar />

      {/* Mobile Slide-out Nav */}
      <MobileNav />

      {/* Main content area */}
      <div className={`relative flex flex-1 flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[220px]"
      }`}>
        {/* Persistent Topbar — 64px, hidden on mobile (MobileNav handles mobile header) */}
        <Topbar title={title} />

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-5 lg:px-6 animate-in fade-in lg:slide-in-from-right duration-500">
          <Suspense fallback={<LoadingState />}>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
