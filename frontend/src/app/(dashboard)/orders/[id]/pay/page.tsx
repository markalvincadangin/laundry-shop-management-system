"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight,
  Wallet,
  Smartphone,
  Banknote
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api-client";
import { ordersService, type OrderResponse } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardContent, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { PAYMENT_STATUS } from "@/constants/payment";
import { PAYMENT_METHOD, type PaymentMethod } from "@/constants/payment";

/**
 * PayOrderPage
 * Financial settlement interface for laundry orders.
 * Aligned with FRONT-001 §2.1 (Design Tokens) and §7 (Lexicon).
 */
export default function PayOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    referenceNumber: string;
    amount: number;
  } | null>(null);
  const { user } = useAuth();
  const staffUserId = user?.userId ?? null;
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CASH);

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

  // Guard: Redirect if already paid
  useEffect(() => {
    if (order?.paymentStatus === PAYMENT_STATUS.PAID) {
      router.replace(`/orders/${orderId}`);
      toast.info(UI_LABELS.forms.checkout.ALREADY_PAID);
    }
  }, [order, orderId, router]);

  useEffect(() => {
    if (order?.grandTotal != null) {
      setAmountPaid(order.grandTotal.toFixed(2));
    }
  }, [order?.grandTotal]);

  const amountNum = parseFloat(amountPaid);
  const amountMatches =
    order?.grandTotal != null &&
    !isNaN(amountNum) &&
    Math.abs(amountNum - order.grandTotal) < 0.01;
  const amountInvalid =
    !isNaN(amountNum) &&
    amountNum > 0 &&
    order?.grandTotal != null &&
    !amountMatches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!staffUserId) {
      setError("Staff session invalid. Please re-authenticate.");
      return;
    }
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      setError("Settlement amount must be positive.");
      return;
    }
    if (order && Math.abs(amount - order.grandTotal) >= 0.01) {
      setError(`Amount must exactly match ${UI_LABELS.units.PRICE_SYMBOL}${order.grandTotal.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    try {
      await paymentsService.create({
        orderId,
        amountPaid: amount,
        paymentMethod,
        receivedByUserId: staffUserId,
      });
      setPaymentSuccess({
        referenceNumber: order?.referenceNumber ?? "",
        amount,
      });
      toast.success(UI_LABELS.feedback.success.UPDATED);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Settlement failed");
      toast.error("Failed to record settlement");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CardSkeleton />;

  if (paymentSuccess) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm overflow-hidden text-center p-10 space-y-8 border-slate-200 shadow-2xl bg-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-blue/5 border border-brand-blue/10 shadow-sm">
            <CheckCircle2 className="h-12 w-12 text-brand-blue" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">{UI_LABELS.forms.checkout.TITLE}</h2>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              {UI_LABELS.shared.common.REFERENCE} {paymentSuccess.referenceNumber}
            </p>
          </div>
          <div className="py-8 border-y border-slate-100 bg-slate-50/50 rounded-2xl">
            <p className="text-4xl font-display font-black text-slate-900 tracking-tight">
              {UI_LABELS.units.PRICE_SYMBOL}{paymentSuccess.amount.toFixed(2)}
            </p>
          </div>
          <Link href={`/orders/${orderId}`} className="block">
            <Button className="w-full h-14 gap-2 bg-brand-blue shadow-lg shadow-brand-blue/20 uppercase font-extrabold text-xs tracking-widest">
              {UI_LABELS.shared.buttons.DONE}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-10 space-y-8 pb-20">
      <div className="space-y-4">
        <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-brand-blue transition-colors min-h-[44px]">
          <ArrowLeft className="h-3 w-3" />
          {UI_LABELS.shared.buttons.BACK}
        </Link>
        <h1 className="text-4xl font-display font-black tracking-tight text-slate-900 flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-brand-blue" />
          {UI_LABELS.forms.checkout.TITLE}
        </h1>
      </div>

      <Card className="border-slate-200 bg-white shadow-xl overflow-hidden">
        <CardContent className="p-10 space-y-10">
          {order && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-inner">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{UI_LABELS.shared.common.ORDER_NUMBER}</p>
                <p className="text-sm font-mono font-bold text-slate-900">{order.referenceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{UI_LABELS.shared.common.TOTAL}</p>
                <p className="text-3xl font-display font-black text-brand-blue tracking-tight">{UI_LABELS.units.PRICE_SYMBOL}{order.grandTotal.toFixed(2)}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="p-5 rounded-xl bg-rose-50 border border-rose-100 flex gap-4 text-rose-700 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{UI_LABELS.forms.checkout.AMOUNT}</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display text-2xl font-black text-slate-300 group-focus-within:text-brand-blue transition-colors">{UI_LABELS.units.PRICE_SYMBOL}</span>
                <input
                  type="number"
                  readOnly
                  value={amountPaid}
                  className="w-full h-20 rounded-2xl border-2 border-slate-100 pl-14 pr-8 font-display text-3xl font-black transition-all outline-none bg-slate-50/50 text-slate-900 cursor-not-allowed shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{UI_LABELS.forms.checkout.METHOD}</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: PAYMENT_METHOD.CASH, icon: Banknote, label: UI_LABELS.modules.payments.METHOD_CASH },
                    { id: PAYMENT_METHOD.GCASH, icon: Smartphone, label: UI_LABELS.modules.payments.METHOD_GCASH },
                    { id: PAYMENT_METHOD.BANK_TRANSFER, icon: Wallet, label: UI_LABELS.modules.payments.METHOD_BANK }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-3 min-h-[100px] shadow-sm ${
                        paymentMethod === m.id
                          ? "border-brand-blue bg-brand-blue/5 text-slate-900 shadow-brand-blue/10"
                          : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <m.icon className={`h-8 w-8 ${paymentMethod === m.id ? "text-brand-blue" : "text-slate-300 transition-colors"}`} />
                      <span className="text-xs font-extrabold uppercase tracking-widest">{m.label}</span>
                    </button>
                  ))}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Button
                type="submit"
                className="w-full h-16 text-lg font-black uppercase tracking-widest gap-3 bg-brand-blue shadow-xl shadow-brand-blue/20 hover:bg-brand-blue/90 active:scale-95 transition-all"
                isLoading={submitting}
                disabled={submitting || !staffUserId || amountInvalid}
              >
                <ShieldCheck className="h-6 w-6" />
                {UI_LABELS.forms.checkout.SETTLE}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

