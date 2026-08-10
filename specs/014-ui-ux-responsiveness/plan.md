# Implementation Plan: UI/UX Refinement & Responsive Layout Enhancement

**Feature**: [`specs/014-ui-ux-responsiveness`](./spec.md)  
**Branch**: `feature/014-ui-ux-responsiveness`  
**Created**: 2026-08-10  
**Status**: Completed

## Technical Context

- **Frontend Tech Stack**: Next.js 15 App Router, React 19, Tailwind CSS, Lucide Icons, Vitest.
- **Backend Tech Stack**: Java 21, Spring Boot 3.5, Spring Data JPA, Flyway, Testcontainers, JUnit.
- **UI Architecture**: Tailwind Breakpoints (`sm`, `md`, `lg`, `xl`), Custom HSL Design Tokens, Hybrid Table/Card Reflow, Framer Motion / CSS Micro-animations.

## Constitution Check

- **Principle I (Feature-First Backend)**: N/A (Pure Frontend UI/UX & Responsive Layout Enhancement).
- **Principle II (Frontend App Router Layering & State)**: All components in `components/features/[feature]/` or `components/layout/`. Direct `fetch` prohibited; all API calls route through `lib/api/`. UI copy extracted to `constants/ui/`.
- **Principle IV (UX Standards & Doherty Threshold)**: Instant touch response (<50ms), zero layout shift (`CLS < 0.05`), skeleton loaders.
- **Principle VIII (Frontend React/Next.js Best Practices)**: Memoized selectors, Suspense boundaries, zero waterfall rendering.

## Proposed Changes

### 1. Global Responsive Layout & Navigation Primitives
#### [MODIFY] [Sidebar.tsx](file:///home/markc/projects/active/laundry-shop-management-system/frontend/src/components/layout/Sidebar.tsx)
- Refine collapsible mobile drawer behavior and active link highlights for touch devices (<768px).

#### [MODIFY] [MobileNav.tsx](file:///home/markc/projects/active/laundry-shop-management-system/frontend/src/components/layout/MobileNav.tsx)
- Ensure 44x44px touch tap targets and smooth backdrop overlays.

#### [MODIFY] [PublicTopNav.tsx](file:///home/markc/projects/active/laundry-shop-management-system/frontend/src/components/layout/PublicTopNav.tsx)
- Ensure responsive navigation on `/` and `/track` routes across mobile and desktop.

---

### 2. Data Grid Mobile Card Reflow Transformation
#### [MODIFY] [DataTable.tsx](file:///home/markc/projects/active/laundry-shop-management-system/frontend/src/components/features/shared/DataTable.tsx)
- Implement **Hybrid Card & Grid Reflow**: Automatically render stacked touch cards on viewports `<768px` and full multi-column table grid on `≥768px`.

---

### 3. Touch UX & Micro-Animation Polish
#### [MODIFY] [IntakeWizard.tsx](file:///home/markc/projects/active/laundry-shop-management-system/frontend/src/components/features/orders/IntakeWizard.tsx)
- Add active scale feedback (`active:scale-95` / `0.97x`) and touch-friendly chip targets in Step 1-3.

---

## Generated Design Artifacts

- **[research.md](./research.md)**: Breakpoint strategy, micro-animation architecture, and CLS minimization.
- **[data-model.md](./data-model.md)**: Responsive state primitives and design system color/elevation tokens.
- **[contracts/ui-contracts.md](./contracts/ui-contracts.md)**: `DataTable` mobile card reflow contract and QuickSelectChip contract.
- **[quickstart.md](./quickstart.md)**: Step-by-step verification guide across all 16 page routes.

---

## Verification Plan

### Automated Tests
- `cd frontend && npm test`: Run Vitest suite across all 29+ component and page test files.

### Manual Verification
- Resize viewport across 375px (mobile), 768px (tablet), 1280px (laptop), and 1920px (4K) on all 16 page routes to verify 0 horizontal scrollbars and clean card reflow.
