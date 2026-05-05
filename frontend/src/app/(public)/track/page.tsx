"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import {
  Search,
  Clock,
  ShieldCheck,
  Package,
  AlertCircle,
  HelpCircle,
  Copy,
  CheckCircle2,
  Bell,
  RefreshCcw,
  ArrowRight,
  X,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { ordersService } from "@/services/orders.service";
import type { components } from "@/types/api.generated";
type OrderTrackingResponse = components["schemas"]["OrderTrackingResponse"];
import { StatusBadge, Card, Button } from "@/components/ui";
import { ProcessStepper } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { ORDER_STATUS, type OrderStatus } from "@/constants/order-status";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_MESSAGES: Record<string, string> = UI_LABELS.portal.tracking.STATUS_MSG;

// States where order is at terminal/pickup — show bell icon instead of alert
const PICKUP_STATES = [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.RELEASED];

/**
 * Public Top Navigation
 * Simple persistent branding + support contact + help link.
 * Post-query: the search X button is sufficient — no redundant "Track Another" in nav.
 * Adheres to FRONT-001 §2.4.2.
 */
function TopNav() {
  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-100 px-grid-8 h-grid-24 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-grid-4 group">
        <div className="relative h-grid-12 w-grid-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-1 transition-all group-hover:scale-105 duration-300 group-hover:shadow-lg group-hover:shadow-brand-blue/10">
          <Image
            src="/branding/logo.svg"
            alt={UI_LABELS.meta.APP_NAME}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-h3 font-semibold font-display text-slate-900 tracking-tight leading-none group-hover:text-brand-blue transition-colors duration-300">
            {UI_LABELS.meta.APP_NAME}
          </h1>
          <div className="flex items-center gap-grid-2 mt-grid-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-700" />
            </span>
            <p className="text-caption font-bold text-slate-500 uppercase tracking-[0.25em]">
              {UI_LABELS.portal.tracking.TITLE}
            </p>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-grid-6">
        <div className="hidden md:flex flex-col items-end">
          <p className="text-caption font-bold text-slate-400 uppercase tracking-widest">
            {UI_LABELS.portal.tracking.SUPPORT_LABEL}
          </p>
          <p className="text-caption font-semibold text-slate-900">
            {UI_LABELS.portal.tracking.SUPPORT_PHONE}
          </p>
        </div>
        <div className="hidden md:block h-grid-8 w-px bg-slate-200" />
        <Link
          href="#"
          className="flex text-caption font-bold text-brand-blue uppercase tracking-widest hover:bg-brand-blue/5 px-grid-5 py-grid-2.5 rounded-xl transition-all items-center gap-grid-2 min-h-[44px]"
        >
          <HelpCircle className="h-grid-4 w-grid-4" strokeWidth={2} />
          {UI_LABELS.shared.common.HELP}
        </Link>
      </div>
    </nav>
  );
}

/**
 * TrackContent: Core tracking portal with full HCI audit applied.
 *
 * HCI Changes (Nielsen Heuristics):
 * H1 — Visibility: Status clearly shown with correct semantic icon per state.
 * H2 — Minimalism: Search bar collapses post-query; Order ID shown once; clock watermark removed; floating icon removed.
 * H3 — Real-world match: Claim instruction promoted to primary CTA within status box.
 * H4 — Consistency: "Live Feed" pill → plain pulsing dot (not a button).
 * H5 — Error prevention: Submit disabled when current query === displayed order.
 * Icon fix: AlertCircle (⚠ = warning) replaced with Bell for notifications; CheckCircle2 for terminal states.
 */
function TrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRef = searchParams.get("ref") || "";
  const [reference, setReference] = useState(initialRef);
  const [order, setOrder] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which ref the current result belongs to, for error-prevention (disable button if unchanged)
  const [displayedRef, setDisplayedRef] = useState<string>("");

  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [initialRef]);

  const handleSearch = async (ref: string) => {
    if (!ref) return;
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const result = await ordersService.trackByReference(ref);
      setOrder(result);
      setDisplayedRef(ref.trim().toUpperCase());
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? UI_LABELS.portal.tracking.NOT_FOUND_DESC
          : err instanceof ApiError
            ? err.message
            : UI_LABELS.feedback.error.SYSTEM_ERROR
      );
      setDisplayedRef("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) return;
    router.push(`/track?ref=${encodeURIComponent(ref)}`);
    handleSearch(ref);
  };

  const handleTrackAnother = () => {
    setOrder(null);
    setError(null);
    setReference("");
    setDisplayedRef("");
    router.push("/track");
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast.success(UI_LABELS.feedback.success.COPIED);
  };

  // Nielsen H5: Button is disabled if the query in the box matches what's already displayed
  const isAlreadyDisplayed =
    !!order && reference.trim().toUpperCase() === displayedRef;

  const isPickupState =
    order && PICKUP_STATES.includes(order.currentStatus as any);
  const StatusIcon = isPickupState ? CheckCircle2 : Bell;
  const statusIconColor = isPickupState ? "text-emerald-700" : "text-brand-cyan";

  const hasResult = !!order && !loading;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <TopNav />

      {/* ───────────────── HERO / SEARCH HUB ───────────────── */}
      {/* HCI H2: Collapse hero when a result is displayed to reclaim vertical space above fold */}
      <section
        className={`relative px-grid-8 lg:px-grid-12 flex flex-col items-center transition-all duration-700 ${hasResult ? "pt-grid-8 pb-grid-6" : "pt-grid-16 pb-grid-16"
          }`}
      >
        {/* Subtle brand gradient behind hero — purely decorative, pointer-events off */}
        <div
          className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[110%] h-[400px] bg-gradient-to-b from-brand-blue/[0.04] to-transparent rounded-full blur-[100px]" />
        </div>

        <div
          className={`max-w-3xl w-full relative z-10 text-center transition-all duration-700 ${hasResult ? "space-y-grid-4" : "space-y-grid-8"
            }`}
        >
          {/* Headline — hide when result is visible (H2: remove irrelevant info) */}
          {!hasResult && (
            <div className="space-y-grid-4">
              <div className="inline-flex items-center gap-grid-2 px-grid-4 py-grid-1.5 bg-brand-blue/5 rounded-full border border-brand-blue/10">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" strokeWidth={2} />
                <p className="text-caption font-bold text-brand-blue uppercase tracking-[0.3em]">
                  {UI_LABELS.portal.tracking.OFFICIAL_PORTAL}
                </p>
              </div>
              <h2 className="text-h1 sm:text-display font-extrabold font-display text-slate-900 tracking-tighter leading-[0.95] max-w-2xl mx-auto">
                {UI_LABELS.portal.tracking.PROMPT}
              </h2>
              <p className="text-body text-slate-500 max-w-md mx-auto leading-relaxed">
                {UI_LABELS.portal.tracking.PROMPT}
              </p>
            </div>
          )}

          {/* Search form — Nielsen H5: submit disabled when result already shown for same ref */}
          <div className="max-w-2xl mx-auto w-full group">
            <form
              onSubmit={handleSubmit}
              className="relative bg-white p-grid-2 rounded-[2.5rem] shadow-lg shadow-brand-blue/5 border border-slate-100 ring-1 ring-slate-900/5 transition-all duration-300 focus-within:shadow-brand-blue/10 focus-within:ring-2 focus-within:ring-brand-blue/20"
            >
              <div className="flex flex-col sm:flex-row gap-grid-2">
                <div className="flex-1 relative flex items-center">
                  <div className="absolute left-grid-4 p-grid-2 bg-brand-blue/5 rounded-2xl text-brand-blue transition-all group-focus-within:bg-brand-blue group-focus-within:text-white">
                    <Search className="h-grid-5 w-grid-5" />
                  </div>
                    <input
                      type="text"
                      placeholder={UI_LABELS.portal.tracking.PLACEHOLDER}
                      value={reference}
                      onChange={(e) =>
                        setReference(e.target.value.toUpperCase())
                      }
                      className="w-full h-grid-18 bg-transparent rounded-[2rem] pl-grid-20 pr-grid-6 font-mono text-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:outline-none uppercase tracking-wider font-bold"
                      autoFocus={!hasResult}
                    />
                  {reference && (
                    <button
                      type="button"
                      onClick={() => setReference("")}
                      className="absolute right-grid-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={UI_LABELS.shared.buttons.CANCEL}
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={isAlreadyDisplayed}
                  className="h-grid-18 min-h-[44px] px-grid-6 gap-grid-2 bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 font-bold uppercase text-caption tracking-[0.2em] rounded-[1.8rem] active:scale-95 transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none disabled:cursor-default disabled:active:scale-100"
                >
                  {isAlreadyDisplayed ? UI_LABELS.portal.tracking.BUTTON_SHOWING : UI_LABELS.portal.tracking.BUTTON_FIND}
                  {!isAlreadyDisplayed && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
                </Button>
              </div>
            </form>

            {!hasResult && (
              <div className="flex flex-wrap justify-center gap-grid-8 mt-grid-6">
                <div className="flex items-center gap-grid-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
                  <span className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                    {UI_LABELS.portal.tracking.REAL_TIME_SYNC}
                  </span>
                </div>
                <div className="flex items-center gap-grid-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
                  <span className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                    {UI_LABELS.portal.tracking.VERIFIED_DATA}
                  </span>
                </div>
                <div className="flex items-center gap-grid-2">
                  <Package className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
                  <span className="text-caption font-bold text-slate-500 uppercase tracking-widest">
                    {UI_LABELS.portal.tracking.OFFICIAL_RECEIPT_ONLY}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────────── CONTENT AREA ───────────────── */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-grid-8 pb-grid-16 space-y-grid-6">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-grid-6 py-grid-20 animate-in fade-in duration-500">
            <div className="relative">
              <RefreshCcw className="h-grid-10 w-grid-10 text-brand-blue animate-spin" />
              <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-xl animate-pulse" />
            </div>
            <p className="text-caption font-bold text-brand-blue uppercase tracking-[0.3em] animate-pulse">
              {UI_LABELS.portal.tracking.SYNCING}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="relative p-grid-12 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/40 text-center space-y-grid-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden max-w-xl mx-auto">
            <div className="h-grid-20 w-grid-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-700 ring-1 ring-rose-700/10">
              <AlertCircle className="h-grid-10 w-grid-10" />
            </div>
            <div className="space-y-grid-3">
              <h3 className="text-h3 font-bold font-display text-slate-900 tracking-tight">
                {error}
              </h3>
              <p className="text-body-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
                {UI_LABELS.portal.tracking.NOT_FOUND_DESC}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => handleSearch(reference)}
              className="mx-auto h-11 min-h-[44px] px-grid-10 gap-grid-3 font-bold text-caption border-slate-200 hover:bg-slate-50 rounded-2xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:outline-none"
            >
              <RefreshCcw className="h-4 w-4" strokeWidth={2} />
              {UI_LABELS.shared.buttons.RETRY}
            </Button>
          </div>
        )}

        {/* ── Order result card ── */}
        {order && !loading && (
          <div className="space-y-grid-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="overflow-hidden border border-slate-100 shadow-xl shadow-brand-blue/5 ring-1 ring-slate-900/5 rounded-3xl bg-white">

              {/* Card Header — reference + status badge */}
              <div className="px-grid-8 py-grid-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-grid-4">
                <div className="flex items-center gap-grid-4">
                  <div className="h-12 w-12 bg-brand-blue/5 rounded-2xl flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-brand-blue" />
                  </div>
                  <div>
                    <div className="flex items-center gap-grid-2">
                      <span className="font-mono font-bold text-slate-900 text-h3 tracking-widest uppercase">
                        {order.referenceNumber}
                      </span>
                      <button
                        onClick={() => copyRef(order.referenceNumber!)}
                        className="p-1.5 hover:bg-brand-blue/5 rounded-lg transition-all text-slate-400 hover:text-brand-blue"
                        title={UI_LABELS.portal.tracking.COPY_TITLE}
                        aria-label={UI_LABELS.portal.tracking.COPY_REF}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-grid-2 mt-0.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <p className="text-caption font-bold text-slate-400 uppercase tracking-widest">
                        {UI_LABELS.portal.tracking.RECEIVED_ON} {formatDate(order.createdAt!)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <p className="text-caption font-bold text-slate-400 uppercase tracking-widest">
                    {UI_LABELS.shared.common.STATUS}
                  </p>
                  <StatusBadge
                    status={order.currentStatus as OrderStatus}
                    className="h-10 px-grid-6 text-caption font-bold"
                  />
                </div>
              </div>

              {/* Card Body — strict 8px grid: py-grid-8 (32px), space-y-grid-8 (32px) between sections */}
              <div className="px-grid-8 py-grid-8 space-y-grid-8">

                {/* Progress stepper section — H1: Visibility of system status, no fold break */}
                <div className="space-y-grid-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-caption font-bold text-slate-900 uppercase tracking-[0.3em]">
                      {UI_LABELS.portal.tracking.CURRENT_PROGRESS}
                    </h4>
                    {/* H4 Consistency: "Live Feed" is NOT a button — pulsing dot only */}
                    <div className="flex items-center gap-grid-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 animate-pulse" />
                      <span className="text-caption font-bold text-emerald-700 uppercase tracking-[0.2em]">
                        {UI_LABELS.shared.common.LIVE}
                      </span>
                    </div>
                  </div>

                  <div className="px-grid-4 py-grid-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <ProcessStepper
                      currentStatus={
                        order.currentStatus ?? ORDER_STATUS.RECEIVED
                      }
                      size="md"
                    />
                  </div>
                </div>

                {/* Order summary meta — simplified for privacy */}
                <div className="grid grid-cols-2 gap-grid-6 pt-grid-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <p className="text-caption font-bold text-slate-400 uppercase tracking-widest">
                      {UI_LABELS.portal.tracking.RECEIVED_ON}
                    </p>
                    <p className="text-body font-bold text-slate-900">
                      {formatDate(order.createdAt!)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-caption font-bold text-slate-400 uppercase tracking-widest">
                      {UI_LABELS.portal.tracking.VERIFIED_DATA}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" strokeWidth={2} />
                      <p className="text-caption font-bold text-emerald-700 uppercase tracking-tight">
                        {UI_LABELS.portal.tracking.VERIFIED_DATA}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status message block
                    H1: Icon is semantic — Bell for in-progress, CheckCircle2 for pickup/released.
                    H2: Clock watermark removed — it was decorative noise.
                    H3: Claim instruction is INSIDE this block (elevated from footer). */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`relative p-grid-8 rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl ${
                    order.currentStatus === 'RELEASED' 
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-emerald-500/20' 
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {/* Decorative Sparkle for Released */}
                  {order.currentStatus === 'RELEASED' && (
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <CheckCircle2 className="h-24 w-24 -rotate-12" />
                    </div>
                  )}

                  <div className="relative flex flex-col sm:flex-row items-start gap-grid-6 z-10">
                    <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${
                      order.currentStatus === 'RELEASED'
                        ? 'bg-white/20 border-white/20'
                        : 'bg-white/10 border-white/10'
                    }`}>
                      <StatusIcon className={`h-6 w-6 ${order.currentStatus === 'RELEASED' ? 'text-white' : statusIconColor}`} />
                    </div>
                    <div className="space-y-grid-2 flex-1">
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                        order.currentStatus === 'RELEASED' ? 'text-emerald-200' : 'text-brand-cyan'
                      }`}>
                        {order.currentStatus === 'RELEASED' ? "Success" : UI_LABELS.portal.tracking.LIVE_UPDATE}
                      </p>
                      <p className="text-body font-bold text-white leading-relaxed">
                        {STATUS_MESSAGES[order.currentStatus ?? ""] ||
                          UI_LABELS.portal.tracking.FALLBACK_PROGRESS}
                      </p>

                      {/* H3 Real-world match: Claim instruction elevated to primary CTA position */}
                      {isPickupState && order.currentStatus !== 'RELEASED' && (
                        <div className="mt-grid-4 pt-grid-4 border-t border-white/10 flex items-start gap-grid-3">
                          <CheckCircle2
                            className="h-5 w-5 text-white/80 shrink-0 mt-1"
                            strokeWidth={2}
                          />
                          <p className="text-body-sm font-medium text-white/80 leading-relaxed">
                            {UI_LABELS.portal.tracking.CLAIM_INSTRUCTION_PREFIX}{" "}
                            <button
                              onClick={() => copyRef(order.referenceNumber!)}
                              className="font-bold text-white underline decoration-dotted underline-offset-2 hover:no-underline transition-all"
                              title={UI_LABELS.portal.tracking.TAP_TO_COPY}
                            >
                              {order.referenceNumber}
                            </button>{" "}
                            {UI_LABELS.portal.tracking.CLAIM_INSTRUCTION_SUFFIX}
                          </p>
                        </div>
                      )}

                      {order.currentStatus === 'RELEASED' && (
                        <div className="mt-grid-4 pt-grid-4 border-t border-white/10">
                          <p className="text-sm font-bold text-emerald-100">
                             We look forward to seeing you again!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Non-pickup states: show a softer claim instruction below the card */}
                {!isPickupState && (
                  <p className="text-body-sm font-medium text-slate-500 text-center leading-relaxed">
                    {UI_LABELS.portal.tracking.KEEP_SAFE_PREFIX}{" "}
                    <button
                      onClick={() => copyRef(order.referenceNumber!)}
                      className="font-bold text-slate-700 underline decoration-dotted underline-offset-2 hover:no-underline"
                      title={UI_LABELS.portal.tracking.TAP_TO_COPY}
                    >
                      {order.referenceNumber}
                    </button>{" "}
                    {UI_LABELS.portal.tracking.KEEP_SAFE_SUFFIX}
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-grid-16 pb-grid-8 text-center space-y-grid-4 border-t border-slate-200/60">
          <div className="flex items-center justify-center gap-grid-3">
            <div className="relative h-grid-5 w-grid-5">
              <Image
                src="/branding/logo.svg"
                alt="Logo"
                fill
                className="object-contain grayscale opacity-40"
              />
            </div>
            <p className="text-caption font-bold text-slate-400 uppercase tracking-[0.3em]">
              {UI_LABELS.meta.APP_NAME} &bull; 2026
            </p>
          </div>
          <p className="text-caption font-bold text-slate-400 uppercase tracking-[0.3em]">
            {UI_LABELS.meta.DEVELOPED_BY} <span className="text-brand-blue">{UI_LABELS.meta.AGENCY}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <RefreshCcw className="h-grid-12 w-grid-12 text-brand-blue animate-spin" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
