# Implementation Plan: frontend-ui-polish

**Branch**: `007-frontend-ui-polish` | **Date**: 2026-07-05 | **Spec**: [spec.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/007-frontend-ui-polish/spec.md)
**Input**: Feature specification from `.specify/specs/007-frontend-ui-polish/spec.md`

## Summary

Standardize the frontend UI components across all 11 screens to strictly adhere to FRONT-001 (F-pattern, Gestalt, Fitts's Law) and Constitution Principle II (App Router layering) using the existing Next.js, Tailwind, and React Context stack.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js, React, TailwindCSS, Lucide-React
**Storage**: N/A
**Testing**: Vitest
**Target Platform**: Web Browser (Desktop focus for operations)
**Project Type**: Next.js App Router Web Application
**Performance Goals**: <400ms visual response (Doherty Threshold)
**Constraints**: No new dependencies, no arbitrary hex codes or spacing values outside of FRONT-001 tokens.

## Constitution Check

*GATE: Must pass before proceeding. Re-check after design phase.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Feature-First Backend | PASS | Not touching backend. |
| II. App Router Layering | PASS | Implementation explicitly enforces no `components/` -> `app/` imports. |
| III. Polyglot Contract Sync | PASS | Not modifying API contracts or business pricing rules. |
| IV. UX Standards | PASS | Doherty Threshold (<400ms) loading states explicitly planned and verified. |
| V. Containerized Dev | PASS | Validation via standard local dev environments. |

## Project Structure

### Documentation (this feature)

```text
.specify/specs/007-frontend-ui-polish/
├── spec.md              
├── plan.md              
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
frontend/src/
├── components/
│   ├── features/
│   │   ├── dashboard/OrderPipeline.tsx
│   │   ├── orders/IntakeWizard.tsx
│   │   ├── shared/DataTable.tsx
│   │   └── ...
│   ├── layout/PageHeader.tsx
│   └── ui/KPICard.tsx
```

**Structure Decision**: Code modifications will be strictly confined to existing files in `frontend/src/components/`. We are standardizing existing implementations, not introducing new directory structures.

## Execution Strategy

### TDD Requirements
- [x] `OrderPipeline.tsx` (Suspense & Optimistic UI): Strict TDD required for fallback states and state rollback on failure.
- [x] `IntakeWizard.tsx` (Error Handling): Strict TDD required to verify button disabled states and Sonner toast dispatches.
- [ ] Pure CSS token adjustments (grid alignment, scrollbars) skip TDD.

### Parallel Execution Opportunities
- [x] Standardizing the `OrderPipeline` Kanban board (concurrency, horizontal scroll) can proceed independently of the `IntakeWizard` step refactoring.

### Human Checkpoints
1. After component standardization — visual review of the UI via `npm run dev`.
2. Before merge — verify `npm run build` and `npm run lint` pass successfully.

### Review Gates
- [x] Visual UX Review: Review UI changes in the browser to ensure the standard 8px grid and tokens are rendered correctly.
