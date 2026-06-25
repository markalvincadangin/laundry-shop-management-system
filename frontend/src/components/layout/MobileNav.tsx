"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/stores/auth-store";
import {
  Menu,
  X,
  LogOut,
  Plus
} from "lucide-react";
import { UI_LABELS } from "@/constants/ui/index";
import { NAVIGATION_GROUPS } from "@/config/navigation";

/**
 * MobileNav Component
 * Provides responsive navigation for handheld devices.
 * Adheres to FRONT-001 design tokens and HCI touch target standards.
 */
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();


  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-2xl">
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={UI_LABELS.layout.nav.DASHBOARD}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href={user ? "/overview" : "/"} className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/branding/logo.svg"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-sm sm:text-base font-display font-bold text-slate-900 uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">
            {UI_LABELS.meta.APP_NAME}
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">

            <Link
              href="/orders?new=true"
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20 active:scale-90 transition-transform"
              aria-label={UI_LABELS.layout.nav.INTAKE}
            >
              <Plus className="h-6 w-6" />
            </Link>
          </div>
        ) : (
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-brand-blue">
            {UI_LABELS.auth.LOGIN_BUTTON}
          </Link>
        )}
      </header>

      {/* Slide-out Sidebar Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-neutral-100 border-r border-slate-200 shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            {/* Header in Drawer */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative h-7 w-7 shrink-0">
                  <Image
                    src="/branding/logo.svg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-display font-bold text-slate-900 tracking-tight">
                  {UI_LABELS.meta.APP_NAME}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                aria-label={UI_LABELS.shared.buttons.CANCEL}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Body */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
              {NAVIGATION_GROUPS.map((group) => {
                const isGroupRestricted = group.role === "ADMIN" && user?.role !== "ADMIN";
                if (isGroupRestricted) return null;

                return (
                  <div key={group.id} className="space-y-2">
                    <h4 className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                      {group.label}
                    </h4>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all uppercase tracking-wider ${isActive
                                ? "bg-brand-blue/5 text-brand-blue shadow-sm ring-1 ring-brand-blue/10"
                                : "text-slate-500 active:bg-slate-200"
                              }`}
                          >
                            <div className="relative">
                              <Icon className={`h-5 w-5 ${isActive ? "text-brand-blue stroke-[2.5px]" : "text-slate-400"}`} />

                            </div>
                            <span className="flex-1 truncate">{item.label}</span>
                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(21,72,157,0.5)]" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Bottom Section — User Identity & Logout */}
            {user && (
              <div className="mt-auto border-t border-slate-200 p-5 bg-white space-y-4">
                <div className="flex items-center gap-4 px-1">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan-dark flex items-center justify-center text-xs font-black text-white shadow-md shadow-brand-blue/20 ring-1 ring-white/20">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-[13px] font-black text-slate-900 leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-700/80 active:bg-rose-50 transition-colors border border-rose-100/50"
                >
                  <LogOut className="h-5 w-5" />
                  {UI_LABELS.shared.buttons.LOGOUT}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
