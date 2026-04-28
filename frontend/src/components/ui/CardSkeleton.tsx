"use client";

/**
 * Skeleton loader for report/dashboard cards. Matches typical report layout.
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
      <div className="mb-6 h-6 w-32 rounded-lg bg-white/10" />
      <div className="space-y-6">
        <div>
          <div className="mb-2 h-3 w-20 rounded-full bg-white/5" />
          <div className="h-10 w-28 rounded-xl bg-white/10" />
        </div>
        <div>
          <div className="mb-2 h-3 w-24 rounded-full bg-white/5" />
          <div className="h-6 w-16 rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}
