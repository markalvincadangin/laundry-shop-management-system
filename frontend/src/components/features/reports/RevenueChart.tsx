"use client";

import React from "react";
import {
  BarChart,
  Bar,
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
  height = 300,
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
    <Card className="h-full border-slate-200 bg-white shadow-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50 px-8 py-6">
        <CardTitle className="text-slate-900 text-xs font-black tracking-[0.2em] uppercase">
          {UI_LABELS.modules.dashboard.WEEKLY_SALES}
        </CardTitle>
        <TrendingUp className="h-5 w-5 text-brand-blue" />
      </CardHeader>
      <CardContent style={{ height }} className="pt-8 px-8 pb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: BRAND_COLORS.slate[500], fontWeight: 700 }} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: BRAND_COLORS.slate[500], fontWeight: 700 }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${UI_LABELS.shared.units.CURRENCY}${value}`}
            />
            {showDetailsOnHover && (
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl ring-1 ring-slate-100">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                          {point.rawDate || point.period}
                        </p>
                        <div className="space-y-1.5">
                          <p className="text-2xl font-display font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            {UI_LABELS.shared.units.CURRENCY}{Number(point.income).toFixed(2)}
                            <ArrowUpRight className="h-5 w-5 text-brand-blue" />
                          </p>
                          {point.orders !== undefined && (
                            <p className="text-xs uppercase font-black tracking-widest text-brand-blue">
                               {point.orders} {UI_LABELS.shared.units.LOADS} {UI_LABELS.shared.status.RELEASED}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            )}
            <Bar 
              dataKey="income" 
              fill={BRAND_COLORS.blue} 
              radius={[6, 6, 0, 0]} 
              maxBarSize={50}
              className="opacity-90 hover:opacity-100 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
