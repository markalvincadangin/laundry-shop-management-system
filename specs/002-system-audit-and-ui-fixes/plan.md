# Implementation Plan: System Audit & UI Fixes

**Branch**: `[002-system-audit-and-ui-fixes]` | **Date**: 2026-07-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-system-audit-and-ui-fixes/spec.md`

## Summary

This plan outlines the architecture for hiding the Messaging feature behind a "Coming Soon" UX, auditing and fixing UI inconsistencies, and performing a systemic integrity audit of the backend business rules.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15.5.15, Java 17

**Primary Dependencies**: `lucide-react`, TailwindCSS, Spring Boot

**Testing**: `vitest` (Frontend), JUnit 5 (Backend)

**Target Platform**: Frontend (`frontend/`) and Backend (`backend/`)

**Constraints**: Must not delete the Messaging page entirely (it is just disabled).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Frontend App Router Layering & State**: We will modify the shared navigation configuration and sidebar components.
- **Backend Pricing Authority**: The audit will strictly enforce that no pricing calculations have leaked to the frontend.
- **PASS**: This plan enforces existing architectural rules.

## Project Structure

### Documentation (this feature)

```text
specs/002-system-audit-and-ui-fixes/
├── plan.md              # This file
├── research.md          # Research on UI consistency & rule tests
├── data-model.md        # Navigation configuration changes
├── quickstart.md        # How to run the audit
└── contracts/           # Empty for this feature
```

### Source Code

```text
frontend/
├── src/
    ├── config/navigation.ts          # Add isComingSoon flag
    ├── components/layout/sidebar.tsx # Render Coming Soon badge
    └── app/(dashboard)/messaging/    # Render Coming Soon modal/page

backend/
└── src/test/java/.../service/        # OrderServiceTest, PricingTest
```

**Structure Decision**: We will update the frontend's navigation config and layout components, and run/update the backend test suites.
