"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /**
   * Optional aria-label for the icon. If provided, the icon will be exposed
   * to assistive technologies as an image with this label. If omitted, the
   * icon is treated as decorative and hidden from screen readers.
   */
  iconAriaLabel?: string;
}

/**
 * Friendly empty state for tables and lists.
 */
export function EmptyState({ title, description, icon, iconAriaLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 px-6">
      {icon && (
        <div
          className="mb-4 text-slate-400"
          {...(iconAriaLabel
            ? { role: "img", "aria-label": iconAriaLabel }
            : { "aria-hidden": true })}
        >
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
