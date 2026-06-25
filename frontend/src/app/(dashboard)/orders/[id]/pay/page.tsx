"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight,
  Smartphone,
  Banknote,
  Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/stores/auth-store";
import { useOrder } from "@/hooks/useOrder";
import { usePaymentAction } from "@/hooks/usePaymentAction";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { Card, CardContent, Button, CurrencyDisplay } from "@/components/ui";
import { UI_LABELS } from "@/constants/ui";
import { PAYMENT_STATUS, PAYMENT_METHOD, type PaymentMethod } from "@/constants/payment";

/**
 * PayOrderPage
 * Financial settlement interface for laundry orders.
 * Hardened v3.0: Aligned with FRONT-001 (Design) and FRONT-002 (Structure).
 */
export default function PayOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  
  // Hardened Logic via Hooks (FRONT-002 Strategy 1)
  const { order, loading, error: fetchError } = useOrder(orderId);
  const { settlePayment, isSubmitting } = usePaymentAction();
  const { user } = useAuth();
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    referenceNumber: string;
    amount: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CASH);
  const [paymentReference, setPaymentReference] = useState("");

  // Guard: Redirect if already paid
  useEffect(() => {
    if (order?.paymentStatus === PAYMENT_STATUS.PAID) {
      router.replace(`/orders/${orderId}`);
    }
  }, [order, orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!user?.userId) {
      setLocalError("Staff session invalid. Please re-authenticate.");
      return;
    }

    if (!order) return;

    try {
      await settlePayment({
        orderId,
        amountPaid: order.grandTotal,
        paymentMethod,
        paymentReference: paymentMethod !== PAYMENT_METHOD.CASH ? paymentReference : undefined,
        receivedByUserId: user.userId,
      });
      
      setPaymentSuccess({
        referenceNumber: order.referenceNumber,
        amount: order.grandTotal,
      });
    } catch (err: any) {
      setLocalError(err.message || "Settlement failed");
    }
  };

  if (loading) return (
    <div className="max-w-xl mx-auto pt-20">
      <CardSkeleton />
    </div>
  );

  const finalError = fetchError || localError;

  return (
    <div className="max-w-xl mx-auto pt-10 space-y-8 pb-20 px-4">
      <AnimatePresence mode="wait">
        {!paymentSuccess ? (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <Link 
                href={`/orders/${orderId}`} 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-blue transition-colors group"
              >
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                {UI_LABELS.shared.buttons.BACK}
              </Link>
              <h1 className="text-4xl font-display font-black tracking-tight text-slate-900 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shadow-sm">
                  <CreditCard className="h-6 w-6" />
                </div>
                {UI_LABELS.forms.checkout.TITLE}
              </h1>
            </div>

            <Card className="border-slate-200 bg-white/70 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
              <CardContent className="p-10 space-y-10">
                {order && (
                  <div className="p-8 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{UI_LABELS.shared.common.ORDER_NUMBER}</p>
                      <p className="text-sm font-mono font-bold text-slate-900 tracking-wider tabular-nums">{order.referenceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{UI_LABELS.shared.common.TOTAL}</p>
                      <CurrencyDisplay 
                        amount={order.grandTotal} 
                        size="xl" 
                        numberClassName="font-black text-brand-blue" 
                      />
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                  {finalError && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 rounded-xl bg-rose-50 border border-rose-100 flex gap-4 text-rose-700 shadow-sm"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-xs font-black uppercase tracking-tight">{finalError}</p>
                    </motion.div>
                  )}

                  {/* Payment Method Grid */}
                  <div className="space-y-6">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      {UI_LABELS.forms.checkout.METHOD}
                    </label>
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
                          className={`flex flex-col items-center justify-center p-6 rounded-[1.5rem] border-2 transition-all gap-3 min-h-[120px] relative active:scale-95 ${
                            paymentMethod === m.id
                              ? "border-brand-blue bg-brand-blue text-white shadow-xl shadow-brand-blue/20 -translate-y-1"
                              : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <m.icon className={`h-8 w-8 ${paymentMethod === m.id ? "text-white" : "text-slate-300"}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                          {paymentMethod === m.id && (
                            <motion.div
                              layoutId="active-method"
                              className="absolute -top-2 -right-2 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-brand-blue/10"
                            >
                              <CheckCircle2 className="h-3 w-3 text-brand-blue" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Reference Field for Digital Payments */}
                  <AnimatePresence>
                    {paymentMethod !== PAYMENT_METHOD.CASH && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-2">
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                            Reference Number / Trace ID
                          </label>
                          <div className="relative group">
                            <ShieldCheck className="h-5 w-5 text-slate-300 group-focus-within:text-brand-blue absolute left-6 top-1/2 -translate-y-1/2 transition-colors" />
                            <input
                              type="text"
                              required
                              placeholder="Enter Reference #"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-16 pl-16 pr-6 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-brand-blue transition-all outline-none shadow-inner"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-6 border-t border-slate-100">
                    <Button
                      type="submit"
                      className="w-full h-20 text-lg font-black uppercase tracking-[0.2em] gap-4 bg-brand-blue shadow-2xl shadow-brand-blue/30 hover:bg-brand-blue/90 active:scale-95 transition-all rounded-[1.25rem]"
                      isLoading={isSubmitting}
                      disabled={isSubmitting || !user}
                    >
                      <ShieldCheck className="h-6 w-6" />
                      {UI_LABELS.forms.checkout.SETTLE}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="payment-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] p-4"
          >
            <Card className="w-full max-w-sm overflow-hidden text-center p-12 space-y-10 border-slate-200 shadow-2xl bg-white rounded-[3rem]">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-success/5 border border-success/10 shadow-inner"
              >
                <CheckCircle2 className="h-16 w-16 text-success" />
              </motion.div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                  {UI_LABELS.forms.checkout.SUCCESS_TITLE || "Payment Confirmed"}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    {UI_LABELS.shared.common.REFERENCE}
                  </span>
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    {paymentSuccess.referenceNumber}
                  </span>
                </div>
              </div>

              <div className="py-10 border-y border-slate-100 bg-slate-50/50 -mx-12 space-y-4">
                <div className="flex flex-col items-center">
                  <CurrencyDisplay 
                    amount={paymentSuccess.amount} 
                    size="xl" 
                    numberClassName="text-6xl font-black text-slate-900" 
                  />
                  <p className="text-[10px] font-black text-success uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {UI_LABELS.modules.payments.VERIFIED_TRANSACTION}
                  </p>
                </div>
              </div>

              <Link href={`/orders/${orderId}`} className="block w-full">
                <Button className="w-full h-16 gap-3 bg-brand-blue shadow-xl shadow-brand-blue/20 uppercase font-black text-xs tracking-[0.2em] rounded-2xl group">
                  {UI_LABELS.shared.buttons.DONE}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
