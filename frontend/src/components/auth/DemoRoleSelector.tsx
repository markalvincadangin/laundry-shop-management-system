"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Briefcase, Search, Info, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { UI_LABELS } from "@/constants/ui";

export interface DemoRole {
  id: string;
  roleName: string;
  scopeBadge: string;
  description: string;
  username: string;
  password?: string;
  isExternalLink?: boolean;
  href?: string;
  icon: typeof ShieldCheck;
  theme: {
    badge: string;
    iconBox: string;
    borderHover: string;
    activeRing: string;
  };
}

const DEMO_ROLES: DemoRole[] = [
  {
    id: "admin",
    roleName: "System Administrator",
    scopeBadge: "Full Access",
    description: "System configuration, service rates, user accounts, and audit trails",
    username: "admin",
    password: "admin123",
    icon: ShieldCheck,
    theme: {
      badge: "bg-blue-100/70 text-blue-900 border-blue-200/80",
      iconBox: "bg-brand-blue text-white",
      borderHover: "hover:border-blue-400 hover:bg-blue-50/40",
      activeRing: "ring-brand-blue",
    },
  },
  {
    id: "staff",
    roleName: "Front Desk Staff",
    scopeBadge: "Operational",
    description: "Order intake, washing and drying progress updates, and payment processing",
    username: "staff",
    password: "admin123",
    icon: Briefcase,
    theme: {
      badge: "bg-slate-100/80 text-slate-800 border-slate-200/80",
      iconBox: "bg-slate-800 text-white",
      borderHover: "hover:border-slate-400 hover:bg-slate-50/50",
      activeRing: "ring-slate-500",
    },
  },
  {
    id: "customer",
    roleName: "Public Order Tracker",
    scopeBadge: "Customer Portal",
    description: "Receipt tracking view accessed by customers (no credentials required)",
    username: "customer_portal",
    isExternalLink: true,
    href: "/track",
    icon: Search,
    theme: {
      badge: "bg-cyan-100/80 text-cyan-900 border-cyan-200/80",
      iconBox: "bg-cyan-600 text-white",
      borderHover: "hover:border-cyan-400 hover:bg-cyan-50/40",
      activeRing: "ring-cyan-500",
    },
  },
];

interface DemoRoleSelectorProps {
  onSelectRole: (role: DemoRole) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function DemoRoleSelector({
  onSelectRole,
  isSubmitting = false,
}: DemoRoleSelectorProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const handleSelect = async (role: DemoRole) => {
    if (isSubmitting) return;
    setSelectedRoleId(role.id);
    await onSelectRole(role);
  };

  return (
    <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue shadow-2xs">
            <Info size={15} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {UI_LABELS.auth.DEMO_TITLE}
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              {UI_LABELS.auth.DEMO_SUBTITLE}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-800">
          {UI_LABELS.auth.DEMO_BADGE}
        </span>
      </div>

      <div className="mt-3.5 space-y-2.5" role="group" aria-label="Demo role selector">
        {DEMO_ROLES.map((role) => {
          const Icon = role.icon;
          const isCurrentLoading = isSubmitting && selectedRoleId === role.id;

          if (role.isExternalLink && role.href) {
            return (
              <Link
                key={role.id}
                href={role.href}
                className={`group relative flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-2xs transition-all ${role.theme.borderHover}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${role.theme.iconBox} shadow-2xs transition-transform group-hover:scale-105`}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                        {role.roleName}
                      </span>
                      <span
                        className={`inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${role.theme.badge}`}
                      >
                        {role.scopeBadge}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-slate-500">
                      {role.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center pl-2 text-slate-400 group-hover:text-brand-blue transition-colors">
                  <ArrowRight
                    size={14}
                    strokeWidth={2.2}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            );
          }

          return (
            <motion.button
              key={role.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelect(role)}
              whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              className={`group relative flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-2xs transition-all ${role.theme.borderHover} ${
                isCurrentLoading ? `ring-2 ${role.theme.activeRing}` : ""
              } disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${role.theme.iconBox} shadow-2xs transition-transform group-hover:scale-105`}
                >
                  {isCurrentLoading ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <Icon size={16} strokeWidth={2.2} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                      {role.roleName}
                    </span>
                    <span
                      className={`inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${role.theme.badge}`}
                    >
                      {role.scopeBadge}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-slate-500">
                    {role.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center pl-2 text-slate-400 group-hover:text-brand-blue transition-colors">
                <ArrowRight
                  size={14}
                  strokeWidth={2.2}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
