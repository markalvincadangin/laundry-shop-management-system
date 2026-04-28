"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useClientAlerts } from "@/hooks/useClientAlerts";
import { UI_LABELS } from "@/constants/ui";
import { formatRelativeTime } from "@/lib/utils";

/**
 * ClientAlertPopover — Actionable alerts center (v1.0).
 * Replaces the direct link to /client-alerts with a non-navigating disclosure.
 * Focuses on FAILED alerts (Actionable Items).
 */
export function ClientAlertPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { alerts: notifications, loading, markAsRead, markAllAsRead } = useClientAlerts();

  // Number on bell: Only count UNREAD notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ${isOpen ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        aria-label={`${UI_LABELS.layout.nav.CLIENT_ALERTS}${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className={`h-[18px] w-[18px] ${unreadCount > 0 ? "animate-pulse" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white ring-1 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[520px] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/60 z-[500] animate-in fade-in zoom-in-95 duration-200">          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-600">
              {UI_LABELS.layout.nav.CLIENT_ALERTS}
            </h3>
            {unreadCount > 0 ? (
              <button 
                onClick={() => markAllAsRead()}
                className="text-[10px] font-bold text-brand-blue hover:underline uppercase tracking-tight"
              >
                Mark all read
              </button>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                All caught up
              </span>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[380px] py-1">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="h-4 w-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{UI_LABELS.shared.common.LOADING}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{UI_LABELS.modules.clientAlerts.EMPTY_TITLE}</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">Everything is running smoothly.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`group px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer relative ${
                      !notif.isRead ? "bg-brand-blue/[0.02]" : "opacity-60"
                    }`}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-blue rounded-r-full" />
                    )}
                    <div className="flex gap-3">
                      <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.status === "FAILED" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
                      }`}>
                        {notif.status === "FAILED" ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            notif.status === "FAILED" ? "text-rose-600" : "text-slate-500"
                          }`}>
                            {notif.status === "FAILED" ? UI_LABELS.modules.clientAlerts.STATUS_ACTION_REQUIRED : UI_LABELS.modules.clientAlerts.SYSTEM_ALERT}
                          </span>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-[12px] leading-snug line-clamp-2 ${
                          !notif.isRead ? "text-slate-900 font-medium" : "text-slate-500"
                        }`}>
                          {notif.message}
                        </p>
                        {!notif.isRead && (
                          <div className="mt-1.5 flex gap-2">
                             <span className="text-[9px] font-bold text-brand-blue uppercase tracking-tight group-hover:underline">
                                Mark as read
                             </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            href="/client-alerts"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors"
          >
            {UI_LABELS.shared.buttons.VIEW_ALL}
            <ArrowRight className="h-3 w-3" />
          </Link>

        </div>
      )}
    </div>
  );
}
