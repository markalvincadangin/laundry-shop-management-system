"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Printer,
  Eye,
  CreditCard,
  Settings2,
  Calendar,
  User,
  Package,
  Weight,
  Clock,
  ChevronRight,
  ShieldAlert,
  Edit2,
  Trash2,
  Plus,
  Phone,
  Copy,
  Check,
  ShieldCheck,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api-client";
import {
  ordersService,
  type OrderResponse,
  type UpdateOrderRequest,
} from "@/services/orders.service";
import type { components } from "@/types/api.generated";
import { StatusBadge, CurrencyDisplay, Button, Input } from "@/components/ui";
import { paymentsService } from "@/services/payments.service";
import { OrderStatusTimeline } from "@/features/orders/OrderStatusTimeline";
import { ClaimStub } from "@/features/orders/ClaimStub";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProcessStepper } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { STATUS_TRANSITIONS, ORDER_STATUS, type OrderStatus } from "@/constants/order-status";
import { PAYMENT_STATUS } from "@/constants/payment";

type AddOnInput = components["schemas"]["AddOnInput"];

function OrderEditForm({
  order,
  onSaved,
  onCancel,
  onError,
}: {
  order: OrderResponse;
  onSaved: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [extraMinutes, setExtraMinutes] = useState(order.extraMinutes?.toString() ?? "0");
  const [addOns, setAddOns] = useState<AddOnInput[]>(
    (order.addOns ?? []).map((a) => ({
      name: a.name,
      price: typeof a.price === "number" ? a.price : Number(a.price),
      quantity: a.quantity ?? 1,
    }))
  );
  const [newAddOn, setNewAddOn] = useState({ name: "", price: "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedMin = parseInt(extraMinutes, 10);
      const body: UpdateOrderRequest = {
        extraMinutes: isNaN(parsedMin) ? 0 : parsedMin,
        addOns: addOns.length > 0 ? addOns : undefined,
      };
      await ordersService.update(order.id!, body);
      toast.success(UI_LABELS.feedback.success.GENERIC);
      onSaved();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const addAddOn = () => {
    const price = parseFloat(newAddOn.price);
    if (!newAddOn.name.trim() || isNaN(price) || price <= 0) return;
    setAddOns((prev) => [
      ...prev,
      { name: newAddOn.name.trim(), price, quantity: 1 },
    ]);
    setNewAddOn({ name: "", price: "" });
  };

  return (
    <Card className="no-print border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Edit2 className="h-4 w-4 text-brand-blue" />
          {UI_LABELS.modules.orders.DETAILS}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <Input
            label={UI_LABELS.forms.intake.EXTRA_MINS}
            type="number"
            min={0}
            value={extraMinutes}
            onChange={(e) => setExtraMinutes(e.target.value)}
            className="border-slate-200 h-14"
          />

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{UI_LABELS.modules.orders.ADD_ONS}</label>
            <div className="space-y-2">
              {addOns.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                  <span className="text-sm font-bold text-slate-700">{a.name} <span className="mx-2 opacity-30">|</span> <span className="font-mono tabular-nums">{UI_LABELS.units.PRICE_SYMBOL}{a.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                  <Button variant="ghost" size="sm" onClick={() => setAddOns(prev => prev.filter((_, idx) => idx !== i))} className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Input placeholder={UI_LABELS.forms.intake.ADD_ON_NAME} value={newAddOn.name} onChange={(e) => setNewAddOn(n => ({ ...n, name: e.target.value }))} className="flex-1 border-slate-200 h-14" />
              <Input type="number" placeholder={UI_LABELS.units.PRICE_SYMBOL} value={newAddOn.price} onChange={(e) => setNewAddOn(n => ({ ...n, price: e.target.value }))} className="w-24 border-slate-200 h-14" />
              <Button variant="secondary" size="sm" onClick={addAddOn} className="h-14 w-14 p-0 shadow-sm border-slate-200">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button onClick={handleSave} isLoading={saving} className="flex-1 h-14 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase font-extrabold text-xs tracking-widest">{UI_LABELS.shared.buttons.SAVE}</Button>
          <Button variant="outline" onClick={onCancel} disabled={saving} className="flex-1 h-14 border-slate-200 uppercase font-extrabold text-xs tracking-widest">{UI_LABELS.shared.buttons.BACK}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const staffUserId = user?.userId ?? null;

  const [confirmStatusModal, setConfirmStatusModal] = useState<string | null>(null);
  const [confirmVoidModal, setConfirmVoidModal] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchOrder = useCallback(() => {
    ordersService
      .getById(orderId)
      .then(setOrder)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : UI_LABELS.feedback.error.GENERIC);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const requestStatusUpdate = (newStatus: string) => {
    if (!staffUserId) return;
    setConfirmStatusModal(newStatus);
  };

  const doUpdateStatus = async () => {
    if (!staffUserId || !confirmStatusModal) return;
    const newStatus = confirmStatusModal;
    setUpdating(true);
    try {
      await ordersService.updateStatus(orderId, {
        newStatus: newStatus as OrderResponse["currentStatus"],
        changedByUserId: staffUserId,
      });
      toast.success(UI_LABELS.feedback.success.GENERIC);
      setConfirmStatusModal(null);
      fetchOrder();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : UI_LABELS.feedback.error.GENERIC);
    } finally {
      setUpdating(false);
    }
  };

  const doVoidPayment = async () => {
    setIsVoiding(true);
    try {
      await paymentsService.voidPayment(orderId);
      toast.success(UI_LABELS.feedback.success.GENERIC);
      setConfirmVoidModal(false);
      fetchOrder();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : UI_LABELS.feedback.error.GENERIC);
    } finally {
      setIsVoiding(false);
    }
  };

  if (loading) return <CardSkeleton />;
  if (error || !order) return <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">{error ?? UI_LABELS.feedback.error.NOT_FOUND}</div>;

  const transition = STATUS_TRANSITIONS[order.currentStatus as OrderStatus];
  const allowedNextStatuses = [];
  if (transition) {
    if (transition.next !== ORDER_STATUS.RELEASED || order.paymentStatus === PAYMENT_STATUS.PAID) {
      allowedNextStatuses.push(transition.next);
    }
  }
  if (order.currentStatus !== ORDER_STATUS.RELEASED && order.currentStatus !== ORDER_STATUS.CANCELLED && order.currentStatus !== ORDER_STATUS.READY_FOR_PICKUP) {
    allowedNextStatuses.push(ORDER_STATUS.CANCELLED);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-4">
          <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-brand-blue transition-colors">
            <ArrowLeft className="h-3 w-3" />
            {UI_LABELS.layout.nav.ORDERS}
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-display tracking-tight text-slate-900 font-mono tabular-nums">
              {order.referenceNumber}
            </h1>
            <StatusBadge status={order.currentStatus as any} />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="h-12 px-6 border-slate-200 text-xs font-extrabold uppercase tracking-widest" onClick={() => setShowReceiptModal(true)}>
            <Eye className="h-4 w-4" />
            {UI_LABELS.modules.orders.VIEW_RECEIPT}
          </Button>
          {user?.role === "ADMIN" && (order.paymentStatus === PAYMENT_STATUS.PAID || order.paymentStatus === PAYMENT_STATUS.PARTIAL) ? (
            <Button
              variant="outline"
              onClick={() => setConfirmVoidModal(true)}
              className="h-12 px-8 border-rose-200 text-rose-600 hover:bg-rose-50 uppercase font-extrabold text-xs tracking-widest shadow-sm"
            >
              <ShieldAlert className="h-4 w-4" />
              {UI_LABELS.modules.payments.VOIDED}
            </Button>
          ) : (
            !order.paymentStatus || order.paymentStatus === PAYMENT_STATUS.UNPAID ? (
              <Link href={`/orders/${order.id}/pay`}>
                <Button className="h-12 px-8 bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 active:scale-95 transition-all uppercase font-extrabold text-xs tracking-widest">
                  <CreditCard className="h-4 w-4" />
                  {UI_LABELS.modules.payments.RECORD_PAYMENT}
                </Button>
              </Link>
            ) : null
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Stepper */}
          <Card className="p-10 no-print border-slate-200 bg-white shadow-sm">
            <ProcessStepper currentStatus={order.currentStatus ?? ORDER_STATUS.RECEIVED} />
          </Card>

          {/* Customer Info Card */}
          <Card className="overflow-hidden no-print border-slate-200 bg-white shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-brand-blue/5 flex items-center justify-center border border-brand-blue/10">
                <User className="h-6 w-6 text-brand-blue" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">{UI_LABELS.shared.common.CUSTOMER}</h3>
                <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">{UI_LABELS.modules.customers.REGISTRY}</p>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{order.customerName}</p>
                  <div className="flex items-center gap-3 mt-3 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-brand-blue/40" />
                      <span className="text-[11px] font-black uppercase tracking-tight">
                        {UI_LABELS.shared.common.CONTACT}:{" "}
                        <span className="text-slate-900 font-mono tabular-nums">
                          {order.contactNumber || "None"}
                        </span>
                      </span>
                    </div>
                    {order.contactNumber && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.contactNumber!);
                          toast.success(UI_LABELS.shared.buttons.COPY + " " + UI_LABELS.feedback.success.GENERIC);
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-brand-blue transition-colors group/copy"
                        title={UI_LABELS.shared.buttons.COPY}
                      >
                        <Copy className="h-3 w-3 group-active/copy:scale-90 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/customers/${order.customerId}`}>
                    <Button variant="outline" size="sm" className="h-11 px-6 gap-2 border-slate-200 text-[11px] font-black uppercase tracking-[0.1em] text-slate-600 shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
                      {UI_LABELS.shared.common.DETAILS}
                      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details Breakdown */}
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
                  <Package className="h-6 w-6 text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">{UI_LABELS.modules.orders.DETAILS}</h3>
                  <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">{UI_LABELS.modules.orders.PRICING_SUMMARY}</p>
                </div>
              </div>
              {!isEditing && order.currentStatus !== ORDER_STATUS.RELEASED && order.currentStatus !== ORDER_STATUS.CANCELLED && order.paymentStatus !== PAYMENT_STATUS.PAID && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-10 gap-2 no-print text-brand-blue hover:bg-brand-blue/5 border border-transparent hover:border-brand-blue/10 px-4 text-xs font-bold uppercase tracking-widest">
                  <Settings2 className="h-4 w-4" />
                  {UI_LABELS.shared.buttons.EDIT}
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="p-6">
                <OrderEditForm
                  order={order}
                  onSaved={() => { fetchOrder(); setIsEditing(false); }}
                  onCancel={() => setIsEditing(false)}
                  onError={(m) => toast.error(m)}
                />
              </div>
            ) : (
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Weight className="h-3 w-3" /> {UI_LABELS.modules.orders.WEIGHT}
                    </p>
                    <p className="text-xl font-black text-slate-900 font-mono tabular-nums">{order.weightKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-xs opacity-40 font-bold uppercase font-sans tracking-widest">{UI_LABELS.units.WEIGHT}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Package className="h-3 w-3" /> {UI_LABELS.modules.orders.LOADS}
                    </p>
                    <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
                      {order.totalLoads} 
                      <span className="text-xs opacity-40 font-bold uppercase font-sans tracking-widest ml-1">
                        {order.totalLoads === 1 ? UI_LABELS.shared.units.LOAD : UI_LABELS.shared.units.LOADS}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {UI_LABELS.modules.orders.EXTRA_TIME}
                    </p>
                    <p className="text-xl font-black text-slate-900 font-mono tabular-nums">{order.extraMinutes ?? 0} <span className="text-xs opacity-40 font-bold uppercase font-sans tracking-widest">{UI_LABELS.units.TIME}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> {UI_LABELS.shared.common.DATE}
                    </p>
                    <p className="text-sm font-black text-slate-900 tabular-nums">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <User className="h-3 w-3" /> {UI_LABELS.shared.common.STAFF}
                    </p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.createdByUsername || "System Agent"}</p>
                  </div>
                </div>

                {order.notes && (
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                      <FileText className="h-3 w-3" /> {UI_LABELS.modules.orders.SPECIAL_INSTRUCTIONS}
                    </p>
                    <p className="text-sm font-medium text-slate-600 bg-brand-blue/5 p-5 rounded-2xl border border-brand-blue/10 italic leading-relaxed break-words whitespace-pre-wrap">
                      &quot;{order.notes}&quot;
                    </p>
                  </div>
                )}

                <div className="space-y-4 pt-8 border-t border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">{UI_LABELS.modules.orders.SERVICE_FEE}</span>
                    <span className="font-mono font-black text-slate-900 tabular-nums">{UI_LABELS.units.PRICE_SYMBOL}{order.baseAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {(order.extraMinutesAmount ?? 0) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">{UI_LABELS.modules.orders.EXTRA_TIME_FEE}</span>
                      <span className="font-mono font-black text-slate-900 tabular-nums">{UI_LABELS.units.PRICE_SYMBOL}{order.extraMinutesAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {order.addOns && order.addOns.length > 0 ? (
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{UI_LABELS.modules.orders.ADD_ONS}</p>
                      {order.addOns.map((addon, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-bold italic text-xs">+ {addon.name} (x{addon.quantity})</span>
                          <span className="font-mono font-black text-slate-700 tabular-nums">{UI_LABELS.units.PRICE_SYMBOL}{((addon.price || 0) * (addon.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  ) : (order.addonsTotalAmount ?? 0) > 0 ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">{UI_LABELS.modules.orders.EXTRAS}</span>
                      <span className="font-black text-slate-900 tabular-nums">{UI_LABELS.units.PRICE_SYMBOL}{order.addonsTotalAmount?.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between items-end pt-10 mt-6 border-t-2 border-slate-900/5">
                    <div className="space-y-1">
                      <span className="text-2xl font-display font-black text-slate-900 uppercase tracking-tighter leading-none block">{UI_LABELS.shared.common.TOTAL}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-1">{UI_LABELS.modules.orders.PAYMENT_TIMING}</span>
                    </div>
                    <CurrencyDisplay 
                      amount={order.grandTotal} 
                      size="xl"
                      className="text-7xl text-brand-blue"
                      symbolClassName="text-brand-blue/40 mr-2"
                      numberClassName="font-display font-black tracking-tighter"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-8 no-print">
          {/* Operations Panel */}
          {allowedNextStatuses.length > 0 && (
            <Card className="overflow-hidden border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{UI_LABELS.modules.orders.NEXT_STEP}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {order.paymentStatus !== PAYMENT_STATUS.PAID && order.currentStatus === ORDER_STATUS.READY_FOR_PICKUP && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-[11px] font-black text-amber-800 leading-relaxed uppercase tracking-tight">
                      {UI_LABELS.modules.orders.PAYMENT_REQUIRED}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {allowedNextStatuses.map((nextStatus) => {
                    const currentTransition = STATUS_TRANSITIONS[order.currentStatus as OrderStatus];
                    const label = (nextStatus === ORDER_STATUS.CANCELLED)
                      ? UI_LABELS.shared.buttons.CANCEL
                      : (currentTransition?.next === nextStatus ? currentTransition.label : nextStatus);

                    return (
                      <Button
                        key={nextStatus}
                        onClick={() => requestStatusUpdate(nextStatus)}
                        disabled={updating}
                        variant={nextStatus === ORDER_STATUS.CANCELLED ? "outline" : "primary"}
                        className={nextStatus === ORDER_STATUS.CANCELLED
                          ? "text-rose-600 border-rose-200 hover:bg-rose-50 font-black uppercase text-[11px] tracking-[0.1em] h-14 shadow-sm"
                          : "bg-brand-blue shadow-lg shadow-brand-blue/20 font-black uppercase text-[11px] tracking-[0.2em] h-16 active:scale-95 transition-all group"}
                      >
                        <span className="flex-1 text-left">{label}</span>
                        <ChevronRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-8 border-slate-200 bg-white shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-8 ml-1">{UI_LABELS.modules.orders.HISTORY}</h3>
            <OrderStatusTimeline
              currentStatus={order.currentStatus ?? ""}
              auditLogs={order.auditLogs ?? []}
            />
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmStatusModal}
        title={confirmStatusModal === ORDER_STATUS.CANCELLED ? "Cancel Order?" : "Update Status?"}
        description={
          confirmStatusModal === ORDER_STATUS.CANCELLED
            ? UI_LABELS.modals.confirm.CANCEL_ORDER_DESC
            : (STATUS_TRANSITIONS[order.currentStatus as OrderStatus]?.confirm ?? "")
        }
        confirmText={confirmStatusModal === ORDER_STATUS.CANCELLED ? UI_LABELS.shared.buttons.CANCEL : UI_LABELS.shared.buttons.CONFIRM}
        isDestructive={confirmStatusModal === ORDER_STATUS.CANCELLED}
        icon={confirmStatusModal === ORDER_STATUS.CANCELLED ? ShieldAlert : ShieldCheck}
        isLoading={updating}
        onConfirm={doUpdateStatus}
        onCancel={() => setConfirmStatusModal(null)}
      />

      <ConfirmDialog
        isOpen={confirmVoidModal}
        title={UI_LABELS.modals.confirm.VOID_PAYMENT_TITLE}
        description={UI_LABELS.modals.confirm.VOID_PAYMENT_DESC}
        confirmText={UI_LABELS.modules.payments.VOIDED}
        isDestructive={true}
        icon={ShieldAlert}
        isLoading={isVoiding}
        onConfirm={doVoidPayment}
        onCancel={() => setConfirmVoidModal(false)}
      />

      <ClaimStub
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        order={order}
      />
    </div>
  );
}

