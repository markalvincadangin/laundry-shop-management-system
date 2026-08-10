# Tasks: UI/UX Refinement & Responsive Layout Enhancement

**Input**: Design documents from `specs/014-ui-ux-responsiveness/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Task Format

```text
- [ ] [ID] [P?] [TDD?] [SUBAGENT?] [REVIEW?] [Story?] Description with file path
```

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [x] T001 Verify frontend environment and Vitest setup in `frontend/src/tests/`
- [x] T002 [P] Audit design system breakpoints and HSL color variables in `frontend/src/app/globals.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core layout primitives and responsive grid utilities that MUST be complete before user story refinements

- [x] T003 [P] Refine dynamic viewport breakpoint detection hook in `frontend/src/hooks/useBreakpoint.ts`
- [x] T004 [P] Update DataTable component to support mobile card reflow in `frontend/src/components/features/shared/DataTable.tsx`

**Checkpoint**: Foundation ready. Proceed to User Story 1.

---

## Phase 3: User Story 1 - Adaptive Navigation & Mobile Table Card Reflow across All Portals (Priority: P1) MVP

**Goal**: Ensure all 16 application routes (`/`, `/track`, `/login`, `/overview`, `/orders`, `/orders/new`, `/orders/[id]`, `/orders/[id]/pay`, `/customers`, `/customers/[id]`, `/payments`, `/rates`, `/messaging`, `/audit-logs`, `/machines`, `/users`) render fluidly on viewports from 320px to 2560px with touch drawer navigation and stacked mobile cards for data tables.  
**Independent Test**: Resize viewport to 375px (mobile), 768px (tablet), and 1280px (desktop) across all 16 page routes and verify 0 horizontal scrollbars and clean card reflow.

- [x] T005 [P] [US1] Refine touch drawer navigation and responsive rail in `frontend/src/components/layout/Sidebar.tsx`
- [x] T006 [P] [US1] Refine mobile top bar and tap targets in `frontend/src/components/layout/MobileNav.tsx`
- [x] T007 [P] [US1] Polish public header and tracking layout responsiveness in `frontend/src/components/layout/PublicTopNav.tsx`
- [x] T008 [P] [US1] Enable hybrid mobile card reflow for Orders table in `frontend/src/app/(dashboard)/orders/page.tsx`
- [x] T009 [P] [US1] Enable hybrid mobile card reflow for Customers table in `frontend/src/app/(dashboard)/customers/page.tsx`
- [x] T010 [P] [US1] Enable hybrid mobile card reflow for Payments table in `frontend/src/app/(dashboard)/payments/page.tsx`
- [x] T011 [P] [US1] Enable hybrid mobile card reflow for Rates table in `frontend/src/app/(dashboard)/rates/page.tsx`
- [x] T012 [P] [US1] Enable hybrid mobile card reflow for Audit Logs table in `frontend/src/app/(dashboard)/audit-logs/page.tsx`
- [x] T013 [P] [US1] Enable hybrid mobile card reflow for Machines table in `frontend/src/app/(dashboard)/machines/page.tsx`
- [x] T014 [P] [US1] Enable hybrid mobile card reflow for Users table in `frontend/src/app/(dashboard)/users/page.tsx`

**Checkpoint**: User Story 1 complete and independently testable.

---

## Phase 4: User Story 2 - Order Intake Wizard & Form Touch UX (Priority: P1)

**Goal**: Touch-optimized form controls, quick-select chips (<50ms feedback), auto-scrolling validations, and live price summary on mobile (`/orders/new`).  
**Independent Test**: Complete a 3-step order intake on mobile viewport (375px) on `/orders/new` and verify touch targets, quick-select chip responsiveness, and validation focus.

- [x] T015 [P] [US2] Enhance quick-select chips and tactile touch active states in `frontend/src/components/features/orders/IntakeWizard.tsx`
- [x] T016 [US2] Add touch-friendly step validation auto-scroll and focus handling in `frontend/src/components/features/orders/IntakeWizard.tsx`

**Checkpoint**: User Story 2 complete and independently testable.

---

## Phase 5: User Story 3 - Visual Hierarchy, Dark/Light Polish & Dashboard Micro-Animations (Priority: P2)

**Goal**: Tactile spring/scale feedback (0.97x press), zero layout shift (CLS < 0.05), and unified loading skeletons across all dashboard routes.  
**Independent Test**: Verify active press scaling (0.97x) on buttons, card hover transitions on `/overview`, and layout stability during data load.

- [x] T017 [P] [US3] Apply active press scale (`0.97x` / `active:scale-95`) to UI buttons in `frontend/src/components/ui/button.tsx`
- [x] T018 [P] [US3] Align loading skeleton bounds in `frontend/src/components/ui/TableSkeleton.tsx` and `frontend/src/components/ui/CardSkeleton.tsx`
- [x] T019 [US3] Enhance dashboard status card hover transitions in `frontend/src/components/features/dashboard/OrderCard.tsx`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Application-wide accessibility verification and full test suite validation

- [x] T020 [P] Audit all interactive tap targets for minimum 44x44px compliance across components in `frontend/src/components/`
- [x] T021 [REVIEW] Run complete Vitest test suite (`cd frontend && npm test`) and verify all 29+ test files pass cleanly

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS user story tasks.
- **User Story 1 (Phase 3)**: Depends on Foundational (T003, T004).
- **User Story 2 (Phase 4)**: Can proceed in parallel with User Story 1 or after T003.
- **User Story 3 (Phase 5)**: Depends on Foundational components.
- **Polish (Phase 6)**: Depends on completion of User Stories 1-3.

---

## Superpowers Execution

### Execution Discipline by Marker
- **[P]**: Launch parallel tasks where possible.
- **[REVIEW]**: Pause execution after test suite run to report completion to user.
