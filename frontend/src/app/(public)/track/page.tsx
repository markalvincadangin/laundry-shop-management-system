"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { RefreshCcw } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { ordersService } from "@/lib/api/orders";
import type { components } from "@/types/api.generated";
type OrderTrackingResponse = components["schemas"]["OrderTrackingResponse"];
import { UI_LABELS } from "@/constants/ui";
import { PublicTopNav } from "@/components/layout";
import {
  TrackingSearch,
  TrackingResultCard,
} from "@/components/features/tracking";

function TrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTracking = searchParams.get("trackingNumber") || searchParams.get("ref") || "";
  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [order, setOrder] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayedTracking, setDisplayedRef] = useState<string>("");

  useEffect(() => {
    if (initialTracking) {
      handleSearch(initialTracking);
    }
  }, [initialTracking]);

  const handleSearch = async (ref: string) => {
    if (!ref) return;
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const result = await ordersService.trackByTrackingNumber(ref);
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
    const ref = trackingNumber.trim().toUpperCase();
    if (!ref) return;
    router.push(`/track?ref=${encodeURIComponent(ref)}`);
    handleSearch(ref);
  };

  const isAlreadyDisplayed =
    !!order && trackingNumber.trim().toUpperCase() === displayedTracking;
  const hasResult = !!order && !loading;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <PublicTopNav variant="tracking" />

      {/* Hero / Search Hub */}
      <TrackingSearch
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        handleSubmit={handleSubmit}
        loading={loading}
        isAlreadyDisplayed={isAlreadyDisplayed}
        hasResult={hasResult}
        hasError={!!error && !loading}
      />

      {/* Content Area */}
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

        {/* Order result card */}
        {order && !loading && <TrackingResultCard order={order} />}

        {/* Footer */}
        <footer className="pt-grid-16 pb-grid-8 text-center space-y-grid-4 border-t border-slate-200/60">
          <div className="flex items-center justify-center gap-grid-3">
            <div className="relative h-grid-5 w-grid-5">
              <Image
                src="/assets/app-icon/app-icon.svg"
                alt="Logo"
                fill
                className="object-contain grayscale opacity-40"
              />
            </div>
            <p className="text-caption font-bold text-slate-400 uppercase tracking-[0.3em]">
              {UI_LABELS.meta.APP_NAME} {UI_LABELS.dynamic.BULL__2026}
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
