"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

/**
 * Friendly empty state for tables and lists.
 */
export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 px-6">
      {icon && (
        <div className="mb-4 text-slate-400" aria-hidden>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-700">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-center text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}
