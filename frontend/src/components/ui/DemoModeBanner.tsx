"use client";

import { Info, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";
import type { CurrentUserResponse } from "@/lib/api/auth";
import { UI_LABELS } from "@/constants/ui";

interface DemoModeBannerProps {
  user: CurrentUserResponse | null;
  onSwitchRole: () => void;
}

export default function DemoModeBanner({
  user,
  onSwitchRole,
}: DemoModeBannerProps) {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== "true") {
    return null;
  }

  const roleName = user?.role || "User";
  const isAdmin = roleName.toUpperCase() === "ADMIN";
  const RoleIcon = isAdmin ? ShieldCheck : Briefcase;
  const roleDisplay = isAdmin ? "Administrator" : "Staff Operator";

  return (
    <div className="mb-6 rounded-2xl border border-blue-200/70 bg-gradient-to-r from-blue-50/90 via-white to-slate-50/80 p-3.5 shadow-2xs backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue text-white shadow-2xs">
            <Info size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-950">
                {UI_LABELS.auth.DEMO_BANNER_TITLE}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100/60 px-2 py-0.5 text-[10px] font-semibold text-blue-900">
                <RoleIcon size={12} strokeWidth={2.2} />
                <span>{roleDisplay}</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {UI_LABELS.auth.DEMO_BANNER_DESC}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchRole}
          className="inline-flex items-center justify-center gap-1.5 self-start sm:self-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-brand-blue transition-all cursor-pointer shrink-0"
        >
          <span>{UI_LABELS.auth.DEMO_SWITCH_IDENTITY}</span>
          <ArrowRight size={12} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
