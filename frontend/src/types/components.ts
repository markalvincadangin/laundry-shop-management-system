import { LucideIcon } from "lucide-react";
import { OrderStatus } from "@/constants/order-status";
import type { components } from "./api.generated";

/**
 * Prop interfaces for shared UI components.
 * Mandated by FRONT-001 §8.1.
 */

// --- Atoms ---

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "action";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glass-light" | "accent";
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: "default" | "glass";
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  variant?: "default" | "glass";
  containerClassName?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export interface StatusBadgeProps {
  status?: OrderStatus;
  label?: string;
  variant?: "primary" | "success" | "warning" | "error" | "neutral" | "action" | "rush";
  icon?: React.ElementType;
  className?: string;
}

export interface KPICardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ElementType;
  variant?: "default" | "accent" | "success" | "warning";
  pulse?: boolean;
  /** When provided, makes the card clickable (e.g. scroll-to-column). Min-h 44px touch target enforced via wrapper. */
  onClick?: () => void;
  className?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDestructive?: boolean;
  icon?: React.ElementType;
  children?: React.ReactNode;
}

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface UndoToastProps {
  message: string;
  onUndo: () => void;
  duration?: number;
}



export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// --- Molecules ---

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  variant?: "default" | "premium";
}

export interface DataTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortKey?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  density?: "default" | "compact";
  isStickyHeader?: boolean;
  maxHeight?: string;
  scrollAreaClassName?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
}

export interface FilterBarProps {
  children: React.ReactNode;
  title?: string;
  onApply?: () => void;
  onClear?: () => void;
}

// --- Organisms ---

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  variant?: "default" | "accent" | "success" | "warning" | "danger";
  icon?: LucideIcon;
}

export interface RevenueChartProps {
  data: Array<{ period: string; income: number; orders?: number; rawDate?: string }>;
  loading?: boolean;
  height?: number | string;
  showDetailsOnHover?: boolean;
  onPointClick?: (point: { period: string; income: number; orders?: number; rawDate?: string }) => void;
}

export interface ProcessStepperProps {
  currentStatus: string;
  size?: "xs" | "sm" | "md";
  onStepClick?: (status: string) => void;
  isInteractive?: boolean;
}

export interface OrderStatusTimelineProps {
  currentStatus: string;
  auditLogs?: components["schemas"]["AuditLogResponse"][] | null;
}

export interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconAriaLabel?: string;
  action?: React.ReactNode;
  compact?: boolean;
}


export interface DetailedSalesTableProps {
  date?: string;
  from?: string;
  to?: string;
  label?: string;
}

export interface PaymentLedgerTableProps {
  payments: components["schemas"]["PaymentResponse"][];
  loading?: boolean;
  onRowClick?: (payment: components["schemas"]["PaymentResponse"]) => void;
}

export interface OrderIntakeFormProps {
  createdByUserId: string | null;
  onSuccess?: () => void;
  isModal?: boolean;
}

export interface CommandActionProps {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?: "primary" | "secondary";
}

export interface ActivityItemProps {
  id: string;
  type: "status" | "payment" | "alert";
  title: string;
  timestamp: string;
  staff: string;
  isLast?: boolean;
}

export interface TopbarProps {
  /** Page title rendered in the topbar left zone. */
  title: string;
}

export interface OrderPreviewProps {
  customerName?: string;
  serviceType: string;
  weightKg: number;
  extraMinutes: number;
  notes?: string;
  addOns?: Array<{ name: string; price: number; quantity: number }>;
  preview: components["schemas"]["OrderPreviewResponse"] | null;
  loading?: boolean;
}


