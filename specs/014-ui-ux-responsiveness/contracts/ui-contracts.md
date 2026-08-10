# UI Component Contracts: UI/UX Refinement & Responsive Layout Enhancement

**Feature**: [`specs/014-ui-ux-responsiveness`](../spec.md)
**Created**: 2026-08-10

## 1. DataTable Responsive Card Reflow Contract

```typescript
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Optional custom card renderer for mobile viewports (<768px) */
  mobileCardRender?: (item: TData) => React.ReactNode;
  /** Primary identifier accessor for fallback card header */
  mobileTitleKey?: keyof TData;
  /** Secondary subtitle accessor for fallback card body */
  mobileSubtitleKey?: keyof TData;
  isLoading?: boolean;
}
```

## 2. Touch Quick-Select Chip Contract

```typescript
export interface QuickSelectChipProps {
  id: string;
  label: string;
  priceTag?: string;
  selected: boolean;
  onToggle: (id: string) => void;
  badgeText?: string;
  disabled?: boolean;
}
```
