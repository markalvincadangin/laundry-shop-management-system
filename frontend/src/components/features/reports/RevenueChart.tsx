"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { RevenueChartProps } from "@/types/components";
import { Card, CardHeader, CardTitle, CardContent, ChartSkeleton } from "@/components/ui";
import { EmptyState } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { BRAND_COLORS } from "@/constants/brand-colors";

/**
 * RevenueChart Component
 * Visualizes shop revenue using Recharts.
 * Adheres to FRONT-001 design tokens and HCI accessibility rules.
 */
export function RevenueChart({ 
  data, 
  loading, 
  height = 400,
  showDetailsOnHover = true,
  onPointClick
}: RevenueChartProps) {
  const [isPrint, setIsPrint] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrint(true);
    const handleAfterPrint = () => setIsPrint(false);

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);
  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full border-slate-200 bg-white flex items-center justify-center p-20 shadow-sm">
        <EmptyState 
          title={UI_LABELS.feedback.empty.SALES_TITLE} 
          description={UI_LABELS.feedback.empty.SALES_DESC}
          compact
        />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Card id="revenue-chart" className="h-full border-slate-200 bg-white shadow-xl overflow-hidden rounded-2xl group/chart">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 rounded-lg group-hover/chart:scale-110 transition-transform duration-500">
              <TrendingUp className="h-5 w-5 text-brand-blue" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-slate-900 text-[10px] font-extrabold tracking-[0.2em] uppercase">
                {UI_LABELS.modules.dashboard.WEEKLY_SALES}
              </CardTitle>
              {data.length > 1 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                   {(() => {
                      const last = data[data.length - 1].income;
                      const prev = data[data.length - 2].income;
                      const diff = prev > 0 ? ((last - prev) / prev) * 100 : 0;
                      const isUp = diff >= 0;
                      return (
                        <>
                          <div className={`h-1.5 w-1.5 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isUp ? '+' : ''}{diff.toFixed(1)}% vs Yesterday
                          </span>
                        </>
                      );
                   })()}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <div className="h-2 w-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Active Analysis</span>
          </div>
        </CardHeader>
        <CardContent style={{ height }} className="pt-8 px-4 pb-4">
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(event: any) => {
                if (onPointClick && event?.activePayload?.[0]?.payload) {
                  onPointClick(event.activePayload[0].payload);
                }
              }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND_COLORS.blue} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={BRAND_COLORS.blue} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 10, fill: BRAND_COLORS.slate[500], fontWeight: 800 }} 
                tickLine={false}
                axisLine={false}
                dy={15}
              />
              <YAxis 
                tick={{ fontSize: 9, fill: BRAND_COLORS.slate[400], fontWeight: 800, fontFamily: 'var(--font-mono)' }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${UI_LABELS.shared.units.CURRENCY}${value.toLocaleString()}`}
              />
              {showDetailsOnHover && (
                <Tooltip
                  cursor={{ stroke: BRAND_COLORS.blue, strokeWidth: 2, strokeDasharray: '5 5' }}
                  wrapperStyle={{ pointerEvents: 'auto', outline: 'none' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload;
                      return (
                        <div 
                          onClick={() => onPointClick?.(point)}
                          className={`rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-md p-6 shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-300 ${onPointClick ? 'cursor-pointer hover:bg-slate-50 hover:scale-[1.02] transition-all' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                             <p className="text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] text-slate-400">
                               {point.rawDate || point.period}
                             </p>
                             <div className="p-1 rounded-md bg-slate-50">
                               <TrendingUp className="h-3 w-3 text-brand-blue" />
                             </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <CurrencyDisplay amount={Number(point.income)} size="lg" className="text-slate-900 tracking-tight font-black" />
                            </div>
                            {point.orders !== undefined && (
                               <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                 <p className="text-[9px] uppercase font-extrabold tracking-[0.1em] text-slate-500">
                                    {point.orders} {UI_LABELS.modules.reports.PAID_ORDERS}
                                 </p>
                               </div>
                            )}
                          </div>
                          {onPointClick && (
                            <p className="mt-4 text-[7px] text-brand-blue font-black uppercase tracking-[0.2em] text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to investigate
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              )}
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke={BRAND_COLORS.blue} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                activeDot={{ 
                  r: 8, 
                  stroke: '#fff', 
                  strokeWidth: 3, 
                  fill: BRAND_COLORS.blue,
                  filter: 'drop-shadow(0 4px 6px rgba(21, 72, 157, 0.4))',
                  cursor: 'pointer'
                }}
                isAnimationActive={!isPrint}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

