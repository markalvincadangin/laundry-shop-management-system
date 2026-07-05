"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/stores/auth-store";
import { useLayout } from "@/stores/layout-store";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";

import { UI_LABELS } from "@/constants/ui";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { Tooltip } from "@/components/ui";

/**
 * Sidebar — v4.0
 * Supports collapsible states for maximized workspace.
 * FRONT-001 §11.1.
 * Standardized for professional administrative navigation.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-[100] hidden flex-col border-r border-slate-200/60 bg-neutral-50 lg:flex shadow-lg shadow-slate-200/30 transition-all duration-300 ${
        isSidebarCollapsed ? "w-[72px]" : "w-[220px]"
      }`}
    >
      {/* ── Brand Header ── */}
      <div className="relative">
        <Link
          href="/overview"
          className={`flex h-16 shrink-0 items-center gap-3 px-4 border-b border-slate-200/60 bg-transparent hover:bg-slate-100 transition-all duration-300 ${
            isSidebarCollapsed ? "justify-center" : ""
          }`}
          aria-label={`${UI_LABELS.meta.APP_NAME} — Home`}
        >
          <div className="relative h-9 w-9 shrink-0">
            <Image
              src="/branding/logo.svg"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col leading-none min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[13px] font-black text-slate-800 tracking-tight truncate leading-tight">
                {UI_LABELS.meta.APP_NAME}
              </span>
              <span className="text-[8.5px] font-black uppercase tracking-wider text-brand-blue/80 mt-0.5 truncate">
                {UI_LABELS.meta.APP_TAGLINE}
              </span>
            </div>
          )}
        </Link>

        {/* ── Toggle Button ── */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm hover:bg-slate-50 hover:text-brand-blue transition-all active:scale-95 z-[110]"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 flex flex-col px-3 py-6 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <nav className="flex-1 flex flex-col gap-8">
          {NAVIGATION_GROUPS.map((group) => {
            const isGroupRestricted = group.role === "ADMIN" && user?.role !== "ADMIN";
            if (isGroupRestricted) return null;

            return (
              <div 
                key={group.id} 
                className={`flex flex-col gap-1 transition-all duration-300 ${
                  group.id === "administration" ? "mt-auto pt-6 border-t border-slate-200/60" : ""
                }`}
              >
                {!isSidebarCollapsed && (
                  <span className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 animate-in fade-in duration-300">
                    {group.label}
                  </span>
                )}
                {group.items.map((item) => {
                  const isActive = 
                    pathname === item.href || 
                    (item.href !== "/" && pathname?.startsWith(item.href));
                  const Icon = item.icon;

                  const navItemContent = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-3 rounded-xl py-2.5 text-[10.5px] font-black transition-all duration-300 uppercase tracking-[0.08em] ${
                        isSidebarCollapsed ? "px-2 justify-center" : "px-3"
                      } ${
                        isActive
                          ? "bg-brand-blue/8 text-brand-blue"
                          : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      {/* Icon container */}
                      <div
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-brand-blue text-white shadow-md shadow-brand-blue/25"
                            : "bg-white text-slate-300 border border-slate-100 group-hover:border-slate-200 group-hover:text-slate-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                      </div>

                      {/* Label */}
                      {!isSidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                          <span className="truncate">{item.label}</span>
                          {item.isComingSoon && (
                            <span className="ml-2 inline-flex shrink-0 items-center rounded bg-slate-200/60 px-1.5 py-[2px] text-[7.5px] font-black uppercase tracking-wider text-slate-500">
                              Soon
                            </span>
                          )}
                        </div>
                      )}

                      {/* Active indicator dot */}
                      {isActive && !isSidebarCollapsed && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue shrink-0 animate-in fade-in zoom-in duration-300" />
                      )}
                    </Link>
                  );

                  return isSidebarCollapsed ? (
                    <Tooltip key={item.href} content={item.label} position="right">
                      {navItemContent}
                    </Tooltip>
                  ) : (
                    navItemContent
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Footer — User identity & logout ── */}
      <div className={`shrink-0 border-t border-slate-200/80 p-3 bg-white/60 backdrop-blur-sm transition-all duration-300 ${
        isSidebarCollapsed ? "flex flex-col items-center gap-4" : ""
      }`}>
        <div className={`flex items-center gap-3 px-2 mb-2 ${isSidebarCollapsed ? "justify-center" : ""}`}>
          <Tooltip content={user?.username || UI_LABELS.shared.common.LOADING} position="right" disabled={!isSidebarCollapsed}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-blue-700 text-white shadow-md shadow-brand-blue/20">
              <span className="text-[11px] font-black">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "..."}
              </span>
            </div>
          </Tooltip>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="truncate text-[12px] font-black text-slate-900 leading-tight">
                {user?.username || UI_LABELS.shared.common.LOADING}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {user?.role || "..."}
                </span>
              </div>
            </div>
          )}
        </div>

        <Tooltip content={UI_LABELS.shared.buttons.LOGOUT} position="right" disabled={!isSidebarCollapsed}>
          <button
            onClick={() => logout()}
            className={`flex items-center gap-2.5 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest text-rose-600/80 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200 active:scale-95 ${
              isSidebarCollapsed ? "w-10 justify-center px-0" : "w-full px-3"
            }`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!isSidebarCollapsed && UI_LABELS.shared.buttons.LOGOUT}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
