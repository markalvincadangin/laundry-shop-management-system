"use client";

import { useRef, useState } from "react";
import {
  LayoutGrid,
  Activity,
  Package,
  TrendingUp,
  PhilippinePeso,
  Zap,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OrderPipeline } from "@/features/dashboard";
import { SectionHeader, ErrorState } from "@/features/shared";
import { PageHeader } from "@/components/layout";
import { KPICard, CurrencyDisplay, Button } from "@/components/ui";
import { PaymentActionModal } from "@/components/features/payments";
import { UI_LABELS } from "@/constants/ui";
import { useOrders } from "@/hooks/useOrders";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Dashboard (Home) — High-Fidelity v5.0
 * FRONT-001 §11: Command Center layout.
 * Reimagined with premium aesthetics, dynamic visual hierarchy, and glassmorphism.
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
    <div className="max-w-[1600px] mx-auto pb-grid-20 space-y-grid-12 px-4 xl:px-0">
      <PageHeader
        variant="premium"
        title={UI_LABELS.layout.nav.DASHBOARD}
        subtitle={formatDate(new Date())}
        icon={LayoutGrid}
        actions={
          <Button 
            variant="secondary" 
            size="md" 
            className="h-12 px-grid-6 gap-grid-2 uppercase text-[10px] tracking-widest font-black border-slate-200/60 bg-white/50 backdrop-blur-md shadow-sm hover:bg-white transition-all rounded-xl" 
            onClick={() => refresh()}
            isLoading={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {UI_LABELS.shared.common.REFRESH}
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} reset={() => refresh()} />
      ) : (
        <div className="space-y-grid-16">
          {/* ── KPI Row ── §11.2 ────────────────────────────────────────── */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 xl:grid-cols-4 gap-grid-6"
            >
              <KPICard
                title={stats.inProgress === 1 ? "Active Load" : UI_LABELS.modules.dashboard.KPI_ACTIVE_LOADS}
                value={stats.inProgress}
                subtitle={UI_LABELS.modules.dashboard.CURR_PROCESSING}
                icon={Activity}
                variant="accent"
                pulse
              />
              <KPICard
                title={stats.readyForPickup === 1 ? "Ready Order" : UI_LABELS.modules.dashboard.KPI_READY_PICKUP}
                value={stats.readyForPickup}
                subtitle={UI_LABELS.modules.dashboard.WAITING_CUST}
                icon={Package}
                variant="success"
                onClick={handleReadyKPIClick}
              />
              <KPICard
                title={stats.todaysOrders === 1 ? "New Order" : UI_LABELS.modules.dashboard.KPI_TODAYS_ORDERS}
                value={stats.todaysOrders}
                subtitle={UI_LABELS.modules.dashboard.CREATED_TODAY}
                icon={TrendingUp}
              />
              {user?.role === "ADMIN" && (
                <KPICard
                  title={UI_LABELS.modules.dashboard.KPI_TODAYS_SALES}
                  value={<div className="font-black"><CurrencyDisplay amount={stats.todaysRevenue != null ? Number(stats.todaysRevenue) : 0} size="xl" /></div>}
                  subtitle={UI_LABELS.modules.dashboard.AWAITING_PAYMENT}
                  icon={PhilippinePeso}
                  variant="warning"
                />
              )}
            </motion.div>
          )}

          {/* ── 5-Column Order Pipeline ── §11.3 ───────────────────────── */}
          <div className="space-y-grid-8">
            <div className="flex flex-col gap-grid-2 px-1">
              <div className="flex items-center gap-grid-3">
                 <div className="h-10 w-10 rounded-xl bg-brand-blue/8 flex items-center justify-center border border-brand-blue/10 shadow-sm shadow-brand-blue/5">
                    <Zap className="h-5 w-5 text-brand-blue animate-pulse" />
                 </div>
                 <SectionHeader 
                    title={UI_LABELS.modules.dashboard.QUEUE_TITLE} 
                    viewAllHref="/orders" 
                    className="flex-1"
                 />
              </div>
              <p className="text-body-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-13 opacity-70">
                {UI_LABELS.modules.dashboard.QUEUE_SUBTITLE}
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-[3.5rem] border border-slate-200/50 bg-white/40 backdrop-blur-2xl shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
              <OrderPipeline
                orders={orders}
                onAdvance={handleAdvance}
                loading={loading}
                readyColumnRef={readyColumnRef}
              />
            </motion.div>
          </div>
        </div>
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
