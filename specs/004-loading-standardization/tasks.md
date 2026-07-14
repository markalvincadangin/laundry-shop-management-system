# Implementation Tasks: Feedback & Loading Standardization

**Feature**: `004-loading-standardization`

## Phase 1: Spinner Component Standardization (Priority: P1)

**Goal**: Extract the premium SVG and unify standard components.

- [x] T001 Create `src/components/ui/Spinner.tsx` by extracting the dual-ring gradient SVG from `LoadingState.tsx`. Add `size` variants (`sm`, `md`, `lg`).
- [x] T002 Update `src/components/ui/Button.tsx` to replace the raw CSS border-spin with `<Spinner size="sm" />`.
- [x] T003 Update `src/components/features/shared/LoadingState.tsx` to consume the new `<Spinner size="lg" />` internally.

## Phase 2: In-App Feedback Unification (Priority: P1)

**Goal**: Eradicate `Loader2` and unify data fetching loaders.

- [x] T004 Replace `Loader2` with `Spinner` in `src/components/features/orders/OrderPreview.tsx`.
- [x] T005 Replace `Loader2` with `Spinner` in `src/app/(dashboard)/orders/page.tsx`.
- [x] T006 Replace `Loader2` with `Spinner` in `src/app/(dashboard)/reports/page.tsx`.
- [x] T007 Replace `Loader2` with `Spinner` in `src/app/(dashboard)/payments/page.tsx`.
- [x] T008 Update `src/components/layout/Sidebar.tsx` to replace raw `"Loading..."` text with an appropriate skeleton/placeholder.

## Phase 3: Global Error & Toast Standards (Priority: P2)

**Goal**: Implement `global-error` and standardize Sonner toasts to `UI_LABELS`.

- [x] T009 Create `src/app/global-error.tsx` (using `<html>` and `<body>` tags) and render `ErrorState` within it.
- [x] T010 Update `src/constants/ui/shared.ts` to ensure we have standard generic toast success/error strings if missing.
- [x] T011 Update `src/stores/auth-store.tsx` to use `UI_LABELS` instead of hardcoded `"Signed in successfully"`.
- [x] T012 Update `src/hooks/useOrders.ts` and `src/components/features/orders/IntakeWizard.tsx` to use `UI_LABELS` instead of hardcoded toast strings.

## Phase 4: Verification

**Goal**: Ensure no layout regressions and verify Doherty compliance.

- [x] T013 Run `make test-frontend` to ensure lint/types pass.
- [x] T014 Trigger a simulated loading state to visually verify the SVG gradients and animations function without layout jank.
