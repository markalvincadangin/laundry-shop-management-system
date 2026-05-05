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
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { RevenueChartProps } from "@/types/components";
import { Card, CardHeader, CardTitle, CardContent, ChartSkeleton } from "@/components/ui";
import { EmptyState } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";
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
  showDetailsOnHover = true 
}: RevenueChartProps) {
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
    <Card className="h-full border-slate-200 bg-white shadow-xl overflow-hidden rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-brand-blue" />
          </div>
          <CardTitle className="text-slate-900 text-xs font-black tracking-[0.2em] uppercase">
            {UI_LABELS.modules.dashboard.WEEKLY_SALES}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand-blue" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Revenue</span>
        </div>
      </CardHeader>
      <CardContent style={{ height }} className="pt-8 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND_COLORS.blue} stopOpacity={0.15}/>
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
              tick={{ fontSize: 10, fill: BRAND_COLORS.slate[500], fontWeight: 800 }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${UI_LABELS.shared.units.CURRENCY}${value}`}
            />
            {showDetailsOnHover && (
              <Tooltip
                cursor={{ stroke: BRAND_COLORS.blue, strokeWidth: 2, strokeDasharray: '5 5' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
                          {point.rawDate || point.period}
                        </p>
                        <div className="space-y-1.5">
                          <p className="text-2xl font-display font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            {UI_LABELS.shared.units.CURRENCY}{Number(point.income).toFixed(2)}
                            <ArrowUpRight className="h-4 w-4 text-brand-blue" />
                          </p>
                          {point.orders !== undefined && (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                 {point.orders} Orders Completed
                              </p>
                            </div>
                          )}
                        </div>
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
              activeDot={{ r: 6, strokeWidth: 0, fill: BRAND_COLORS.blue }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

