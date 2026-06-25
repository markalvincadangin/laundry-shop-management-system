"use client";

/**
 * Skeleton for chart area. Matches typical bar chart proportions.
 */
export function ChartSkeleton() {
  return (
    <div className="flex h-64 animate-pulse items-end justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm">
      {[40, 65, 35, 80, 50, 70, 45].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg bg-white/5"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
