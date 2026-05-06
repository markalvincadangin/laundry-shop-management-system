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
  Settings2
} from "lucide-react";
import Link from "next/link";
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
import { OrderResponse } from "@/services/orders.service";

/**
 * Customer Profile Page
 * A dedicated view for managing customer relationships and viewing order history.
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
        <div className="h-20 bg-slate-100 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-6">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl w-full" />
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <div className="bg-error-50 text-error-700 p-grid-6 rounded-2xl border border-error-100 inline-block">
          <p className="font-black uppercase tracking-widest">{customerError || UI_LABELS.modules.customers.NOT_FOUND}</p>
        </div>
        <div className="mt-grid-6">
          <Button onClick={() => router.back()} variant="outline">
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
        <span className="font-mono text-sm font-bold text-slate-900">{o.referenceNumber}</span>
      ),
    },
    {
      header: UI_LABELS.shared.common.DATE,
      render: (o) => (
        <span className="text-body-sm text-slate-500 font-medium">{formatDate(o.createdAt)}</span>
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
        <CurrencyDisplay amount={o.grandTotal} size="md" numberClassName="font-bold text-slate-900" />
      ),
    },
    {
      header: "",
      align: "right",
      render: (o) => (
        <Link href={`/orders/${o.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-brand-blue/10 text-brand-blue">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  const totalSpent = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-grid-10 pb-grid-20">
      {/* Page Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-grid-6">
        <div className="flex items-center gap-grid-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/customers")}
            className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div className="flex items-center gap-grid-4">
            <Avatar name={`${customer.firstName} ${customer.lastName}`} size="lg" className="h-16 w-16 text-h2" />
            <div>
              <h1 className="text-display text-slate-900 tracking-tight">
                {customer.firstName} {customer.lastName}
              </h1>
              <div className="flex items-center gap-grid-4 mt-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-caption font-black tracking-widest">{customer.contactNumber}</span>
                </div>
                <StatusBadge variant="success" label={UI_LABELS.shared.common.ACTIVE} icon={ShieldCheck} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-grid-3">
          <Button 
            variant="outline" 
            onClick={() => setIsEditModalOpen(true)}
            className="h-12 px-grid-6 gap-grid-2 border-slate-200 text-caption font-black uppercase tracking-widest shadow-sm"
          >
            <Settings2 className="h-4 w-4" />
            {UI_LABELS.modules.customers.EDIT_PROFILE}
          </Button>
          <Link href={`/orders?new=true&customerId=${customer.id}`}>
            <Button className="h-12 px-grid-8 gap-grid-2 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase text-caption tracking-widest font-black">
              <Plus className="h-5 w-5" />
              {UI_LABELS.forms.intake.TITLE}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-6">
        <KPICard 
          title={UI_LABELS.modules.customers.TOTAL_ORDERS} 
          value={pagination.totalElements} 
          icon={ShoppingBag}
          variant="default"
        />
        <KPICard 
          title={UI_LABELS.modules.customers.LIFETIME_VALUE} 
          value={<CurrencyDisplay amount={totalSpent} size="xl" />} 
          icon={Wallet}
          variant="accent"
        />
        <KPICard 
          title={UI_LABELS.modules.customers.LAST_VISIT} 
          value={orders[0] ? formatDate(orders[0].createdAt) : UI_LABELS.modules.customers.NO_VISITS} 
          icon={Clock}
          variant="success"
        />
      </div>

      {/* Order History Table */}
      <div className="space-y-grid-6">
        <div className="flex items-center justify-between px-grid-2">
          <h2 className="text-h2 font-black text-slate-900 tracking-tight uppercase">{UI_LABELS.modules.orders.HISTORY}</h2>
          <span className="text-caption font-black text-slate-400 uppercase tracking-widest">
            {UI_LABELS.modules.customers.SHOWING_LAST} {orders.length} {UI_LABELS.pagination.ROWS}
          </span>
        </div>
        
        <DataTable
          data={orders}
          columns={columns}
          loading={ordersLoading}
          emptyState={
            <EmptyState
              title={UI_LABELS.feedback.empty.ORDERS_TITLE}
              description={UI_LABELS.modules.customers.EMPTY_HISTORY}
              icon={<ShoppingBag className="h-12 w-12 text-slate-200" />}
            />
          }
        />

        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.size || 10}
          onPageChange={(p) => setPage(p)} 
          isLoading={ordersLoading}
        />
      </div>
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
