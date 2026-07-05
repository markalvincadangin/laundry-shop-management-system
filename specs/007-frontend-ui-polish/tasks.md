# Implementation Tasks: frontend-ui-polish

**Feature**: frontend-ui-polish  
**Status**: Pending  

## Phase 1: Setup

- [x] T001 Verify standard existing tokens in `tailwind.config.ts` align with FRONT-001 (e.g. `brand-blue`, `radius-2xl`).

## Phase 2: Foundational

- [ ] T002 Identify all shared `status-badge` instances and create a single shared component (or strictly align existing classes) in `frontend/src/components/ui/Badge.tsx`.

## Phase 3: US1 - System-wide Architecture Compliance (P1)

- [ ] T003 [P] [US1] Remove any imports from `src/app/` in `frontend/src/components/layout/PageHeader.tsx` and related components.
- [ ] T004 [P] [US1] Run `npm run lint` and verify component layer isolation.

## Phase 4: US2 - Instant Interaction Feedback (P1)

- [ ] T005 [P] [US2] [TDD] Implement `<Suspense>` fallback skeletons in Dashboard data fetching views (e.g. `frontend/src/components/features/dashboard/OrderPipeline.tsx`).
- [ ] T006 [P] [US2] [TDD] Disable submit button immediately and trigger Sonner error toast on failure in `frontend/src/components/features/orders/IntakeWizard.tsx`.
- [ ] T007 [P] [US2] [TDD] Implement optimistic UI updates for Kanban drag-and-drop in `frontend/src/components/features/dashboard/OrderPipeline.tsx`.

## Phase 5: US3 - Per-Screen Visual Consistency (P2)

- [ ] T008 [P] [US3] Align component containers to the 8px grid and remove ad-hoc `p-[Xpx]` classes across all `frontend/src/components/features/` screens.
- [ ] T009 [P] [US3] Ensure Dashboard Kanban board implements horizontal scrolling with a custom scrollbar in `frontend/src/components/features/dashboard/OrderPipeline.tsx`.
- [ ] T010 [P] [US3] Add 5-minute visual inactivity overlay for shared terminal privacy in `frontend/src/components/layout/PageHeader.tsx` (or root app container).
- [ ] T011 [P] [US3] Add "Discard unsaved changes?" browser warning in `frontend/src/components/features/orders/IntakeWizard.tsx`.

## Phase 6: Polish & Cross-Cutting

- [ ] T012 Verify visual consistency of all modified screens locally via visual review in `npm run dev`.
