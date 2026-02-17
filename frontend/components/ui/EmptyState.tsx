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
  /** Optional CTA (e.g. Link or button) shown below description */
  action?: React.ReactNode;
}

/**
 * Friendly empty state for tables and lists.
 */
export function EmptyState({
  title,
  description,
  icon,
  iconAriaLabel,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-border bg-neutral-base py-16 px-6">
      {icon && (
        <div
          className="mb-4 text-neutral-text-secondary"
          {...(iconAriaLabel
            ? { role: "img", "aria-label": iconAriaLabel }
            : { "aria-hidden": true })}
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-neutral-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-center text-sm text-neutral-text-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
