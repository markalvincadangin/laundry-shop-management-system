/* eslint-disable react/jsx-no-literals */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  Plus, 
  ShoppingBag, 
  Wallet,
  Clock,
  ArrowRight,
  ShieldCheck,
  Settings2,
  History,
  TrendingUp,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomer } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import { Button, KPICard, Avatar, StatusBadge } from "@/components/ui";
import { CustomerEditModal } from "@/components/features/customers";
import { PageHeader } from "@/components/layout";
import { DataTable, Pagination, EmptyState } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { formatDate } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { DataTableColumn } from "@/types/components";
import { OrderResponse } from "@/lib/api/orders";

/**
 * Customer Profile Page — High Fidelity (v4.0)
 * A premium view for managing customer relationships and viewing order history.
 * Adheres to FRONT-001 design standards.
 */
export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);

  const [page, setPage] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { customer, loading: customerLoading, error: customerError, refresh: refreshCustomer } = useCustomer(customerId);
  const { 
    orders, 
    loading: ordersLoading, 
    pagination,
    refresh: refreshOrders 
  } = useOrders({ customerId, page, size: 10 });

  if (customerLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20 animate-pulse">
        <div className="h-24 bg-slate-100 rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-6">
          <div className="h-36 bg-slate-100 rounded-3xl" />
          <div className="h-36 bg-slate-100 rounded-3xl" />
          <div className="h-36 bg-slate-100 rounded-3xl" />
        </div>
        <div className="h-[400px] bg-slate-100 rounded-3xl w-full" />
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-error-50 text-error-500 border border-error-100 shadow-inner">
            <User className="h-10 w-10 opacity-20" />
          </div>
          <div className="space-y-2">
            <h2 className="text-h2 font-black text-slate-900 uppercase tracking-tight">
              {UI_LABELS.modules.customers.NOT_FOUND}
            </h2>
            <p className="text-body-sm text-slate-500">
              The customer you are looking for might have been moved or archived.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/customers")} 
            variant="outline"
            className="h-12 px-8 rounded-xl border-slate-200"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {UI_LABELS.shared.buttons.BACK}
          </Button>
        </div>
      </div>
    );
  }

  const columns: DataTableColumn<OrderResponse>[] = [
    {
      header: UI_LABELS.shared.common.REFERENCE,
      render: (o) => (
        <span className="font-mono text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
          {o.referenceNumber}
        </span>
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      render: (o) => (
        <div className="flex flex-col">
          <span className="text-body-sm text-slate-700 font-bold">{formatDate(o.createdAt)}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">{UI_LABELS.dynamic.ORDER_RECEIVED}</span>
        </div>
      ),
    },
    {
      header: UI_LABELS.shared.common.STATUS,
      render: (o) => (
        <StatusBadge status={o.currentStatus as any} />
      ),
    },
    {
      header: UI_LABELS.shared.common.TOTAL,
      align: "right",
      render: (o) => (
        <CurrencyDisplay 
          amount={o.grandTotal} 
          size="md" 
          numberClassName="font-black text-slate-900" 
        />
      ),
    },
    {
      header: "",
      align: "right",
      render: (o) => (
        <Link href={`/orders/${o.id}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 hover:bg-brand-blue/5 text-slate-400 hover:text-brand-blue rounded-xl transition-all"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  // Note: For MVP, we sum the visible orders. In production, this should come from a backend aggregation.
  const totalSpent = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-grid-8 pb-grid-20 px-4 md:px-0">
      {/* ── Premium Glass Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-grid-6 md:p-grid-8 shadow-sm"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl opacity-60" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-grid-6">
          <div className="flex items-center gap-grid-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push("/customers")}
              className="h-14 w-14 rounded-2xl bg-white/80 shadow-sm border border-slate-100 hover:bg-white hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-slate-600" />
            </Button>
            <div className="flex items-center gap-grid-5">
              <Avatar 
                name={`${customer.firstName} ${customer.lastName}`} 
                size="lg" 
                className="h-20 w-20 text-h1 ring-4 ring-white shadow-xl" 
              />
              <div className="space-y-1">
                <h1 className="text-display md:text-[32px] text-slate-900 tracking-tight leading-none">
                  {customer.firstName} {customer.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-grid-4">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 shadow-inner">
                    <Phone className="h-3 w-3 text-brand-blue" />
                    <span className="text-[11px] font-black tracking-widest text-slate-600">{customer.contactNumber}</span>
                  </div>
                  <StatusBadge variant="success" label={UI_LABELS.shared.common.ACTIVE} icon={ShieldCheck} className="shadow-sm" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-grid-3 items-center">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
              className="h-13 px-grid-6 gap-grid-2 border-slate-200 text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 active:scale-95 transition-all rounded-xl"
            >
              <Settings2 className="h-4 w-4" />
              {UI_LABELS.modules.customers.EDIT_PROFILE}
            </Button>
            <Link href={`/orders?new=true&customerId=${customer.id}`}>
              <Button className="h-13 px-grid-8 gap-grid-2 bg-brand-blue shadow-lg shadow-brand-blue/25 uppercase text-[11px] font-black tracking-widest hover:bg-brand-blue/90 active:scale-95 transition-all rounded-xl">
                <Plus className="h-5 w-5" />
                {UI_LABELS.forms.intake.TITLE}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div data-testid="kpi-grid" className="grid grid-cols-1 md:grid-cols-3 gap-grid-6">
        <KPICard 
          title={UI_LABELS.modules.customers.TOTAL_ORDERS} 
          value={pagination.totalElements} 
          icon={ShoppingBag}
          variant="default"
          className="rounded-3xl border-slate-200/60 shadow-sm"
        />
        <KPICard 
          title={UI_LABELS.modules.customers.LIFETIME_VALUE} 
          value={<CurrencyDisplay amount={totalSpent} size="xl" />} 
          icon={TrendingUp}
          variant="accent"
          className="rounded-3xl shadow-md border-brand-blue/10"
        />
        <KPICard 
          title={UI_LABELS.modules.customers.LAST_VISIT} 
          value={orders[0] ? formatDate(orders[0].createdAt) : UI_LABELS.modules.customers.NO_VISITS} 
          icon={Clock}
          variant="success"
          className="rounded-3xl border-slate-200/60 shadow-sm"
        />
      </div>

      {/* ── Order History Section ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-grid-6 pt-grid-4"
      >
        <div className="flex items-center justify-between px-grid-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
              <History className="h-5 w-5 text-slate-400" />
            </div>
            <h2 className="text-h2 font-black text-slate-900 tracking-tight uppercase">
              {UI_LABELS.modules.orders.HISTORY}
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-inner">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {UI_LABELS.modules.customers.SHOWING_LAST} {orders.length} {UI_LABELS.pagination.ROWS}
            </span>
          </div>
        </div>
        
        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <DataTable
            data={orders}
            columns={columns}
            loading={ordersLoading}
            emptyState={
              <EmptyState
                title={UI_LABELS.feedback.empty.ORDERS_TITLE}
                description={UI_LABELS.modules.customers.EMPTY_HISTORY}
                icon={<ShoppingBag className="h-16 w-16 text-slate-100" />}
              />
            }
          />
        </div>

        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.size || 10}
          onPageChange={(p) => setPage(p)} 
          isLoading={ordersLoading}
        />
      </motion.div>

      <CustomerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onSuccess={() => {
          refreshCustomer();
          refreshOrders();
        }}
      />
    </div>
  );
}
