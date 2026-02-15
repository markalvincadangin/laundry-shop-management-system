"use client";

/**
 * Skeleton for chart area. Matches typical bar chart proportions.
 */
export function ChartSkeleton() {
  return (
    <div className="flex h-64 animate-pulse items-end justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4">
      {[40, 65, 35, 80, 50, 70, 45].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-slate-200"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
