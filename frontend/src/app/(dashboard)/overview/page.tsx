"use client";

import { useRef, useState } from "react";
import {
  LayoutGrid,
  Activity,
  Package,
  TrendingUp,
  PhilippinePeso,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OrderPipeline } from "@/features/dashboard";
import { SectionHeader, ErrorState } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { KPICard } from "@/components/ui";
import { PaymentActionModal } from "@/components/features/payments";
import { UI_LABELS } from "@/constants/ui";
import { useOrders } from "@/hooks/useOrders";
import { formatDate, formatCurrency } from "@/lib/utils";

/**
 * Dashboard (Home) — v3.0
 * FRONT-001 §11: Command Center layout.
 */
export default function Home() {
  const { user } = useAuth();
  const { orders, stats, loading, error, refresh, advanceOrder } = useOrders({
    size: 100,
  });

  const readyColumnRef = useRef<HTMLDivElement>(null);

  const handleReadyKPIClick = () => {
    readyColumnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    readyColumnRef.current?.classList.add("ring-2", "ring-emerald-400", "ring-offset-4");
    setTimeout(() => {
      readyColumnRef.current?.classList.remove("ring-2", "ring-emerald-400", "ring-offset-4");
    }, 1500);
  };

  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    orderId: number;
    grandTotal: number;
    referenceNumber: string;
  }>({
    isOpen: false,
    orderId: 0,
    grandTotal: 0,
    referenceNumber: "",
  });

  const handleAdvance = (orderId: number, nextStatus: string) => {
    if (nextStatus === "RELEASED") {
      const order = orders.find((o) => o.id === orderId);
      if (order && order.paymentStatus === "UNPAID") {
        setPaymentModalState({
          isOpen: true,
          orderId,
          grandTotal: order.grandTotal,
          referenceNumber: order.referenceNumber,
        });
        return;
      }
    }
    advanceOrder(orderId, nextStatus as any);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-16 space-y-8">
      <h2 className="sr-only">
        {UI_LABELS.modules.dashboard.ACCESSIBILITY_TITLE}
      </h2>

      <PageHeader
        title={UI_LABELS.layout.nav.DASHBOARD}
        subtitle={`${UI_LABELS.modules.dashboard.SUBTITLE} ${formatDate(new Date())}`}
        icon={LayoutGrid}
      />

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <>
          {/* ── KPI Row ── §11.2 ────────────────────────────────────────── */}
          {stats && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <KPICard
                title={UI_LABELS.modules.dashboard.KPI_ACTIVE_LOADS}
                value={stats.inProgress}
                subtitle={UI_LABELS.modules.dashboard.CURR_PROCESSING}
                icon={Activity}
                variant="accent"
                pulse
              />
              <KPICard
                title={UI_LABELS.modules.dashboard.KPI_READY_PICKUP}
                value={stats.readyForPickup}
                subtitle={UI_LABELS.modules.dashboard.WAITING_CUST}
                icon={Package}
                variant="success"
                onClick={handleReadyKPIClick}
              />
              <KPICard
                title={UI_LABELS.modules.dashboard.KPI_TODAYS_ORDERS}
                value={stats.todaysOrders}
                subtitle={UI_LABELS.modules.dashboard.CREATED_TODAY}
                icon={TrendingUp}
              />
              {user?.role === "ADMIN" && (
                <KPICard
                  title={UI_LABELS.modules.dashboard.KPI_TODAYS_SALES}
                  value={formatCurrency(stats.todaysRevenue != null ? Number(stats.todaysRevenue) : 0)}
                  subtitle={UI_LABELS.modules.dashboard.AWAITING_PAYMENT}
                  icon={PhilippinePeso}
                  variant="warning"
                />
              )}
            </div>
          )}

          {/* ── 5-Column Order Pipeline ── §11.3 ───────────────────────── */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <SectionHeader title={UI_LABELS.modules.dashboard.QUEUE_TITLE} viewAllHref="/orders" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                {UI_LABELS.modules.dashboard.QUEUE_SUBTITLE}
              </p>
            </div>
            <OrderPipeline
              orders={orders}
              onAdvance={handleAdvance}
              loading={loading}
              readyColumnRef={readyColumnRef}
            />
          </div>
        </>
      )}

      <PaymentActionModal
        isOpen={paymentModalState.isOpen}
        onClose={() => setPaymentModalState((prev) => ({ ...prev, isOpen: false }))}
        orderId={paymentModalState.orderId}
        grandTotal={paymentModalState.grandTotal}
        referenceNumber={paymentModalState.referenceNumber}
        onSuccess={() => {
          advanceOrder(paymentModalState.orderId, "RELEASED" as any);
        }}
      />
    </div>
  );
}
