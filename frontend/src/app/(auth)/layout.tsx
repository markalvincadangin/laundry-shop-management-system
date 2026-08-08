/* eslint-disable react/jsx-no-literals */
import Image from "next/image";
import { UI_LABELS } from "@/constants/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-white overflow-hidden">
      {/* ── Left Side: Brand & Visuals (Desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-slate-950 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/auth/auth-bg.png"
            alt="Faith Laundry Premium Service"
            fill
            className="object-cover opacity-30 scale-105 animate-pulse-slow transition-transform duration-[10000ms] hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/90 via-slate-950/70 to-slate-950" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10">
          <div className="flex items-center gap-grid-4">
            <div className="h-14 w-14 rounded-2xl bg-white p-2.5 shadow-2xl shadow-white/10 ring-1 ring-white/20">
              <Image
                src="/assets/app-icon/app-icon.svg"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-display font-black tracking-tight uppercase leading-none">
                {UI_LABELS.meta.APP_NAME}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan/80 mt-1.5">
                Staff Operations Portal
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-6xl font-display font-black tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-left duration-1000">
            ELEVATING THE <br />
            <span className="text-brand-cyan">{UI_LABELS.dynamic.LAUNDRY} <br /> {UI_LABELS.dynamic.EXPERIENCE}</span>
          </h3>
          <p className="text-base font-medium text-slate-300 leading-relaxed max-w-md opacity-90">
            Streamlining every load, wash, and fold with professional-grade management tools. 
            Designed for the modern garment care professional.
          </p>
        </div>

        <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60">
          © {new Date().getFullYear()} {UI_LABELS.meta.APP_NAME} • {UI_LABELS.meta.AGENCY}
        </div>
      </div>

      {/* ── Right Side: Auth Form Container ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 bg-slate-50 relative overflow-y-auto">
        {/* Mobile Logo (Shown only on small screens) */}
        <div className="lg:hidden mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-16 w-16 bg-white rounded-2xl flex items-center justify-center p-3 shadow-xl ring-1 ring-slate-200">
            <Image
              src="/assets/app-icon/app-icon.svg"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-black tracking-tighter text-slate-900 uppercase">
            {UI_LABELS.meta.APP_NAME}
          </h1>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          {children}
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden mt-12 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
          &copy; {new Date().getFullYear()} {UI_LABELS.meta.APP_NAME}
        </div>
      </div>
    </div>
  );
}

