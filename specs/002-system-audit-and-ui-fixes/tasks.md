# Tasks: System Audit & UI Fixes

**Input**: Design documents from `/specs/002-system-audit-and-ui-fixes/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify backend test coverage for business rules (run `make test-backend`)

---

## Phase 2: User Story 3 - Business Rules Integrity Audit (Priority: P2)

**Goal**: Ensure core pricing rules are mathematically sound and correctly implemented.

### Implementation for User Story 3

- [x] T002 Check `OrderService` and `PricingTest` for coverage of `BR-PR-01` through `BR-PR-05`.
- [x] T003 Ensure order lifecycle logic (`BR-OL-*`) is correctly guarded.

---

## Phase 3: User Story 1 - Graceful "Coming Soon" for Messaging (Priority: P1) 🎯 MVP

**Goal**: Hide Messaging feature behind a "Coming Soon" UX.

### Implementation for User Story 1

- [x] T004 [P] [US1] Update `NavItem` interface in `frontend/src/config/navigation.ts` to include `isComingSoon?: boolean`.
- [x] T005 [P] [US1] Set `isComingSoon: true` for the Messaging link in `frontend/src/config/navigation.ts`.
- [x] T006 [US1] Update `frontend/src/components/layout/sidebar.tsx` to render a "Coming Soon" badge.
- [x] T007 [US1] Update `frontend/src/app/(dashboard)/messaging/page.tsx` to display a "Coming Soon" placeholder layout.

---

## Phase 4: User Story 2 - UI Consistency & UX Fixes (Priority: P1)

**Goal**: Make the UI look polished and consistent across all screens.

### Implementation for User Story 2

- [x] T008 [US2] Audit and fix table consistency across the dashboard.
- [x] T009 [US2] Audit and fix spacing and typography across forms.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: Blocks Phase 2.
- **Phase 2 (Business Rules)**: Backend work, can run parallel to frontend.
- **Phase 3 (Coming Soon)**: Frontend work.
- **Phase 4 (UI Consistency)**: Frontend work.
