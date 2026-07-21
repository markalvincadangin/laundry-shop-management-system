"use client";

/**
 * Skeleton loader for tables. Matches typical list layout to avoid layout shift.
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <table className="min-w-full">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/5">
            {Array.from({ length: cols }).map((_, i) => (
              <th
                key={i}
                className="px-6 py-4"
              >
                <div className="h-2 w-16 rounded-full bg-white/10" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-6 py-5">
                  <div className="h-3 w-full max-w-[140px] rounded-lg bg-white/10" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

