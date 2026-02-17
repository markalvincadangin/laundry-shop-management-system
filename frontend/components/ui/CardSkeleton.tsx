"use client";

/**
 * Skeleton loader for report/dashboard cards. Matches typical report layout.
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-6 w-32 rounded bg-slate-200" />
      <div className="space-y-3">
        <div>
          <div className="mb-1 h-3 w-20 rounded bg-slate-200" />
          <div className="h-8 w-28 rounded bg-slate-200" />
        </div>
        <div>
          <div className="mb-1 h-3 w-24 rounded bg-slate-200" />
          <div className="h-5 w-16 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
