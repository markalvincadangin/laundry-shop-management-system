"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "accent" | "warning" | "success";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  variant = "default",
  className = "",
}: StatCardProps) {
  const variantClasses = {
    default: "border-neutral-border bg-white",
    accent: "border-primary-500/30 bg-primary-50/50",
    warning: "border-warning-600/30 bg-warning-50/50",
    success: "border-success-600/30 bg-success-50/50",
  };

  const valueClasses = {
    default: "text-neutral-text-primary",
    accent: "text-primary-600",
    warning: "text-warning-600",
    success: "text-success-600",
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${variantClasses[variant]} ${className}`}
    >
      <p className="text-sm font-medium text-neutral-text-secondary">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClasses[variant]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-neutral-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
