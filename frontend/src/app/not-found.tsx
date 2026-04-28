"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ChevronLeft, LayoutDashboard } from 'lucide-react';
import { MeshBackground } from '@/components/ui/MeshBackground';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UI_LABELS } from '@/constants/ui';

/**
 * Polished & Professional 404 Page
 * Strictly adheres to FRONT-001 (Design Spec) and HCI Principles.
 * 
 * Corrections:
 * - Removed distracting watermark icons that obstructed text.
 * - Enforced strict 8px grid spacing (§2.3).
 * - Used professional typographic hierarchy (§2.2).
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-neutral-50 font-sans selection:bg-brand-blue/10">
      {/* Brand Identity: Decorative backdrop (§2.1) */}
      <MeshBackground />

      <Card variant="glass" className="relative z-10 w-full max-w-xl overflow-hidden border-white/60 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardContent className="flex flex-col items-center text-center py-16 px-8 md:px-12">

          {/* Error Signaling: Clean and unambiguous (§1.2) */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-8xl md:text-9xl font-black text-rose-700 leading-none tracking-tighter font-display mb-6">
              404
            </h1>

            <div className="flex items-center gap-2 px-4 py-1 bg-rose-50 border border-rose-100 rounded-lg text-rose-700">
              <ShieldAlert size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">
                {UI_LABELS.feedback.error.SYSTEM_ERROR_TITLE}
              </span>
            </div>
          </div>

          {/* Messaging: Simple and professional typography (§2.2) */}
          <div className="space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
              {UI_LABELS.feedback.error.NOT_FOUND_PAGE}
            </h2>

            <p className="text-slate-500 text-base leading-relaxed max-w-md mx-auto">
              {UI_LABELS.feedback.error.NOT_FOUND_DESC}
            </p>
          </div>

          {/* HCI Recovery: High-affordance actions (§1.7) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto min-w-[140px]"
              onClick={() => router.back()}
              leftIcon={<ChevronLeft size={18} strokeWidth={2.5} />}
            >
              {UI_LABELS.shared.buttons.BACK}
            </Button>

            <Link href="/overview" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto min-w-[180px]"
                leftIcon={<LayoutDashboard size={18} strokeWidth={2.5} />}
              >
                {UI_LABELS.layout.nav.DASHBOARD}
              </Button>
            </Link>
          </div>
        </CardContent>

        {/* Visual Identity: Brand-consistent accent footer (§2.1.4) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue to-rose-700 opacity-60"></div>
      </Card>

      {/* Corporate Footprint (§4.67) */}
      <footer className="absolute bottom-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        {UI_LABELS.meta.AGENCY}
      </footer>
    </main>
  );
}
