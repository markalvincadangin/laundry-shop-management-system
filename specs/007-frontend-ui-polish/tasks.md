# Implementation Tasks: frontend-ui-polish

**Feature**: frontend-ui-polish  
**Status**: Pending  

## Phase 1: Setup

- [x] T001 Verify standard existing tokens in `tailwind.config.ts` align with FRONT-001 (e.g. `brand-blue`, `radius-2xl`).

## Phase 2: Foundational

- [x] T002 Identify all shared `status-badge` instances and create a single shared component (or strictly align existing classes) in `frontend/src/components/ui/Badge.tsx`.

## Phase 3: US1 - System-wide Architecture Compliance (P1)

- [x] T003 [P] [US1] Remove any imports from `src/app/` in `frontend/src/components/layout/PageHeader.tsx` and related components.
- [x] T004 [P] [US1] Run `npm run lint` and verify component layer isolation.

### Phase 4: US2 — Instant Interaction Feedback
- [x] **T005:** Implement Suspense skeletons for `frontend/src/components/features/dashboard/OrderPipeline.tsx` [TDD]
- [x] **T006:** Disable submit button immediately and trigger Sonner error toast on failure in `frontend/src/components/features/orders/IntakeWizard.tsx` [TDD]
- [x] **T007:** Implement optimistic UI updates for Kanban drag-and-drop in `frontend/src/components/features/dashboard/OrderPipeline.tsx` [TDD].

## Phase 5: US3 - Per-Screen Visual Consistency (P2)

- [x] **T008.1** [P] [US3] Align `dashboard` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.2** [P] [US3] Align `orders` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.3** [P] [US3] Align `customers` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.4** [P] [US3] Align `payments` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.5** [P] [US3] Align `reports` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.6** [P] [US3] Align `audit-log` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.7** [P] [US3] Align `client-alerts` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.8** [P] [US3] Align `rates` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.9** [P] [US3] Align `users` components to the 8px grid and remove ad-hoc padding/margin.
- [x] **T008.10** [P] [US3] Align `shared` components to the 8px grid and remove ad-hoc padding/margin.
- [x] T009 [P] [US3] Ensure Dashboard Kanban board implements horizontal scrolling with a custom scrollbar in `frontend/src/components/features/dashboard/OrderPipeline.tsx`.
- [x] T010 [P] [US3] Add 5-minute visual inactivity overlay for shared terminal privacy in `frontend/src/components/layout/PageHeader.tsx` (or root app container).
- [x] T011 [P] [US3] Add "Discard unsaved changes?" browser warning in `frontend/src/components/features/orders/IntakeWizard.tsx`.

## Phase 6: Polish & Cross-Cutting

- [x] T012 Verify visual consistency of all modified screens locally via visual review in `npm run dev`.

## Phase 7: Convergence

- [x] T013 [TDD] Update ProgressStepper to use a continuous horizontal line (Gestalt Continuity) per FR-TRACK-1.
- [x] T014 [TDD] Ensure Dashboard order cards present exactly one contextual "Next Step" button per FR-DASH-3.
- [x] T015 [TDD] Structure IntakeWizard as a 4-step wizard with fields top-to-bottom per FR-INTAKE-1, FR-INTAKE-2.
- [x] T016 [TDD] Disable "Settle Balance" button until a payment method is selected per FR-INTAKE-3.
- [x] T017 [TDD] Make Orders Registry data rows fully clickable per FR-REG-1.
- [x] T018 [TDD] Add undo notification window for status reversion in Order Details per FR-DET-2.
- [x] T019 [TDD] Constrain Record Payment inputs to restricted choices per FR-PAY-1.
- [x] T020 [TDD] Implement predictive filtering after 2 characters in Customer Search per FR-CUST-2.
- [x] T021 [TDD] Display historical orders in tabular format in Customer Profile per FR-PROF-1.
- [x] T022 [TDD] Group transaction summary cards using spatial proximity per FR-PROF-2.
- [x] T023 [TDD] Align Messaging delivery status indicators with Dashboard indicators per FR-MSG-1.
