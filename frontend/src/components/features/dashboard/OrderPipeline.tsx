"use client";

import React from "react";
import { OrderResponse } from "@/lib/api/orders";
import { ORDER_STATUS, OrderStatus } from "@/constants/order-status";
import { OrderCard } from "./OrderCard";
import { UI_LABELS } from "@/constants/ui";
import { AnimatePresence } from "framer-motion";
import { MachineAssignmentModal } from "@/components/features/machines/MachineAssignmentModal";
import {
  Inbox,
  WashingMachine,
  Sun,
  Package,
  CheckCircle2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

interface OrderPipelineProps {
  orders: OrderResponse[];
  onAdvance: (orderId: string, nextStatus: OrderStatus, machineIds?: string[]) => void;
  loading?: boolean;
  /** Ref forwarded to the "Ready for Pickup" column for KPI card scroll-to (§11.2) */
  readyColumnRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Column definition for the 5-column v3.0 pipeline.
 * Urgent columns get special visual treatment (§11.5).
 */
interface ColumnConfig {
  id: string;
  title: string;
  icon: React.ElementType;
  status: string;
  /** Tint the entire column background for urgent state */
  urgent?: boolean;
  headerTextClass: string;
  dotClass: string;
  dotPulse?: boolean;
  badgeClass: string;
  bgClass: string;
}

const PIPELINE_COLUMNS: ColumnConfig[] = [
  {
    id: "queue",
    title: UI_LABELS.modules.dashboard.QUEUE_ZONE,
    icon: Inbox,
    status: ORDER_STATUS.RECEIVED,
    urgent: false,
    headerTextClass: "text-slate-400",
    dotClass: "bg-slate-300",
    badgeClass: "bg-slate-100 text-slate-500",
    bgClass: "bg-white/40",
  },
  {
    id: "washing",
    title: UI_LABELS.modules.dashboard.WASHING_ZONE,
    icon: WashingMachine,
    status: ORDER_STATUS.WASHING,
    urgent: false,
    headerTextClass: "text-brand-cyan-dark",
    dotClass: "bg-brand-cyan",
    badgeClass: "bg-sky-50 text-brand-cyan-dark",
    bgClass: "bg-white/40",
  },
  {
    id: "drying",
    title: UI_LABELS.modules.dashboard.DRYING_ZONE,
    icon: Sun,
    status: ORDER_STATUS.DRYING,
    urgent: false,
    headerTextClass: "text-amber-700",
    dotClass: "bg-amber-400",
    badgeClass: "bg-amber-50 text-amber-700",
    bgClass: "bg-white/40",
  },
  {
    id: "folding",
    title: UI_LABELS.modules.dashboard.FOLDING_ZONE,
    icon: Package,
    status: ORDER_STATUS.FOLDING,
    urgent: false,
    headerTextClass: "text-brand-blue",
    dotClass: "bg-brand-blue",
    badgeClass: "bg-blue-50 text-brand-blue",
    bgClass: "bg-white/40",
  },
  {
    id: "ready",
    title: UI_LABELS.modules.dashboard.READY_ZONE,
    icon: CheckCircle2,
    status: ORDER_STATUS.READY_FOR_PICKUP,
    urgent: true,                            // §11.5 Urgent State Treatment
    headerTextClass: "text-emerald-700",
    dotClass: "bg-emerald-500",
    dotPulse: true,
    badgeClass: "bg-emerald-100 text-emerald-700",
    bgClass: "bg-emerald-50/60",            // Emerald tint on column background
  },
];

interface PipelineColumnProps extends ColumnConfig {
  orders: OrderResponse[];
  onAdvance: (orderId: string, nextStatus: OrderStatus) => void;
  isLoading?: boolean;
  colRef?: React.RefObject<HTMLDivElement | null>;
  isSystemPaused?: boolean;
}

function PipelineColumn({
  title,
  icon: Icon,
  orders,
  onAdvance,
  isLoading,
  urgent,
  headerTextClass,
  dotClass,
  dotPulse,
  badgeClass,
  bgClass,
  colRef,
  isSystemPaused,
}: PipelineColumnProps) {
  return (
    <div
      ref={colRef}
      className={`flex flex-col h-full ${bgClass} backdrop-blur-3xl rounded-2xl border border-white/40 overflow-hidden shadow-lg shadow-slate-300/30 transition-all duration-500 w-full group/col`}
    >
      {/* Column Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/40 bg-white/70 backdrop-blur-md shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Status dot with optional pulse ring (§11.5) */}
          <div className="relative flex items-center justify-center">
            <span className={`h-4 w-4 rounded-full shadow-sm ${dotClass}`} />
            {dotPulse && (
              <span
                className={`absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-20 animate-ping`}
                style={{ animationDuration: "2s" }}
              />
            )}
          </div>
          <h3 className={`text-xs font-bold uppercase tracking-[0.2em] font-display ${headerTextClass}`}>
            {title}
          </h3>
        </div>
        {/* Order count badge */}
        <span className={`min-w-8 h-8 flex items-center justify-center px-2 rounded-lg text-xs font-bold shadow-inner ${badgeClass}`}>
          {orders.length}
        </span>
      </div>

      {/* Column Body */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 min-h-[512px]">
        {orders.length === 0 ? (
          /* §11.3.2 — Capacity Available empty state */
          <div className="h-full flex flex-col items-center justify-center py-16 px-6 space-y-4 opacity-40">
            <div className={`h-12 w-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center`}>
              <Plus className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-center leading-relaxed">
              {UI_LABELS.modules.dashboard.CAPACITY_AVAILABLE}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={onAdvance}
                isLoading={isLoading}
                isUrgent={urgent}
                isSystemPaused={isSystemPaused}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton component for OrderPipeline, used for <Suspense> or manual loading states.
 */
export function OrderPipelineSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 items-start">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          data-testid="pipeline-skeleton-col"
          className="h-[560px] w-80 shrink-0 rounded-2xl bg-white/40 border border-slate-100/50 backdrop-blur-md shadow-lg shadow-slate-300/30 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-slate-200/40 bg-white/70">
            <div className="h-4 w-24 bg-slate-200 rounded-md animate-pulse" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-32 w-full bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * OrderPipeline — 5-column v3.0 Kanban pipeline.
 * FRONT-001 §11.3: Queue | Washing | Drying | Folding | Ready for Pickup
 *
 * Viewport: overflow-x-auto for < 1200px, 5-column grid at xl.
 * Urgent state: "Ready for Pickup" column has emerald-50 bg + pulse ring.
 */
export function OrderPipeline({ orders, onAdvance, loading, readyColumnRef }: OrderPipelineProps) {
  const { data: systemSettings } = useSystemSettings();
  const isSystemPaused = systemSettings?.isSystemPaused || false;

  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    orderId: string;
    nextStatus: string;
  }>({ isOpen: false, orderId: "", nextStatus: "" });

  const unavailableMachineIds = React.useMemo(() => {
    return orders
      .filter(o => (o.currentStatus === "WASHING" || o.currentStatus === "DRYING") && o.id !== modalState.orderId)
      .flatMap(o => o.machineIds || []);
  }, [orders, modalState.orderId]);

  if (loading && orders.length === 0) {
    return <OrderPipelineSkeleton />;
  }

  // Split and prioritize orders into column buckets
  const ordersByStatus = (status: string) =>
    orders
      .filter((o) => o.currentStatus === status)
      .sort((a, b) => {
        // Priority 1: Rush Orders first
        // Logic aligned with Orders page: serviceName includes "Rush" or serviceRateId is 2
        const aIsRush = a.serviceName?.includes("Rush") || (a as any).serviceRateId === 2;
        const bIsRush = b.serviceName?.includes("Rush") || (b as any).serviceRateId === 2;
        
        if (aIsRush && !bIsRush) return -1;
        if (!aIsRush && bIsRush) return 1;
        
        // Priority 2: Oldest first (FIFO)
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      });

  const handleInterceptAdvance = (orderId: string, nextStatus: OrderStatus) => {
    if (nextStatus === "WASHING" || nextStatus === "DRYING") {
      setModalState({ isOpen: true, orderId, nextStatus });
    } else {
      onAdvance(orderId, nextStatus);
    }
  };

  const handleModalConfirm = (machineIds: string[]) => {
    onAdvance(modalState.orderId, modalState.nextStatus as OrderStatus, machineIds);
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      {isSystemPaused && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-800">{UI_LABELS.dynamic.SYSTEM_IS_PAUSED__POWER_INTERR}</h4>
            <p className="text-xs text-red-600">{UI_LABELS.dynamic.YOU_CANNOT_START_NEW_WASHING_O}</p>
          </div>
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 items-start">
        {PIPELINE_COLUMNS.map((col) => (
          <div key={col.id} className="w-80 shrink-0">
            <PipelineColumn
              {...col}
              orders={ordersByStatus(col.status)}
              onAdvance={handleInterceptAdvance}
              isLoading={loading}
              isSystemPaused={isSystemPaused}
              colRef={col.id === "ready" ? readyColumnRef : undefined}
            />
          </div>
        ))}
      </div>
      <MachineAssignmentModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        order={orders.find(o => o.id === modalState.orderId) || null}
        nextStatus={modalState.nextStatus}
        unavailableMachineIds={unavailableMachineIds}
        onConfirm={handleModalConfirm}
        isUpdating={loading}
      />
    </>
  );
}
