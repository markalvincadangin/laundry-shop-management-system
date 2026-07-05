<!--
Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0
- List of modified principles:
  - I. Feature-First Backend Organization: Added explicit acknowledgement of the accepted
       pragmatic data-layer coupling (orders/ importing customers/ repos) as a known,
       deliberate architectural decision per docs/05-tech-design/architecture.md (ARCH-001).
  - II. Frontend App Router Layering & State: Corrected dependency rules to match
       ARCH-001 (app/ can import anywhere; components/ may use lib/, stores/,
       hooks/ but NEVER app/; lib/ MUST NOT import React). Confirmed React Context per
       CONTRIBUTING.md.
  - III. Polyglot Contract Sync: Added OpenAPI/type-generation rule from API.md
       (npm run generate:types keeps api.generated.ts in sync). Zod = runtime enforcer.
  - IV. UX Standards & Doherty Threshold: No change — confirmed accurate.
  - V. Containerized Development: No change — confirmed accurate.
- Added sections:
  - Credential & Security Rules (from development-credentials.md)
- Removed sections: None
- Templates requiring updates:
  - plan-template.md: ✅ in sync
  - spec-template.md: ✅ in sync
  - tasks-template.md: ✅ in sync
- Follow-up TODOs: None
-->

# Faith Laundry Shop Management System Constitution

## Core Principles

### I. Feature-First Backend Organization
Backend code MUST be organized by feature package (`customers/`, `orders/`, `payments/`, etc.).
Features MUST NOT import services, mappers, or controllers from other features.
DTOs MUST live inside their feature's `dto/` package. Truly cross-cutting concerns
(e.g., `PageResponse`, `ErrorResponse`, `GlobalExceptionHandler`) belong in `shared/`.

**Acknowledged Coupling Exception**: Because this is a Spring Data JPA monolith, entities
natively reference each other at the data layer (e.g., `Order @ManyToOne Customer`).
`OrderService` directly using `CustomerRepository` is a **deliberate, accepted tradeoff**
for our scale — not a violation. This is documented in `docs/05-tech-design/architecture.md`
(ARCH-001) and MUST NOT be re-refactored without an explicit architectural decision.

### II. Frontend App Router Layering & State
The Next.js frontend MUST follow a strict downward dependency direction:

- `app/` — can import from anywhere.
- `components/` — can import from `lib/`, `stores/`, `hooks/`, but NEVER from `app/`.
- `lib/` — contains pure TypeScript (API clients, Zod schemas, utilities) and MUST NOT
  import React components.

All API calls MUST go through `src/services/` (e.g., `orders.service.ts`) — direct
`axios`/`fetch` calls inside components are prohibited. Zod validation schemas live in
`src/lib/validators.ts`. The path `lib/api/` is **decommissioned** per FRONT-002 §6.3.
Frontend state management uses React Context API (`src/contexts/`). Per FRONT-002 §8.3,
Zustand is not in use.

### III. Polyglot Contract Sync & Business Rule Authority
This project is a polyglot monorepo (Java backend + TypeScript frontend). There is no
automatic type sharing across the language barrier. The following rules MUST be observed:

1. **Dual Updates**: Any backend DTO change MUST be accompanied by a matching frontend
   Zod schema update in the **same Pull Request**.
2. **Type Generation**: When backend endpoints change, regenerate frontend types
   (`npm run generate:types`) so `api.generated.ts` remains accurate.
3. **Zod as Client Runtime Enforcer**: OpenAPI types describe shape; Zod schemas in
   `lib/validation/` are the active runtime enforcers for forms and mutations.
4. **Backend Pricing Authority**: All pricing computations (base load price, kg limit,
   extra-minute rate, add-ons — per `docs/02-requirements/business-rules.md` BR-PR-01
   through BR-PR-04) MUST be computed exclusively by `OrderService`. **Never** hardcode
   or replicate pricing formulas on the frontend.

### IV. UX Standards & Doherty Threshold
All frontend changes MUST adhere to the UX standards documented in
`docs/00-context/content-inventory.md` (NN/g Framework). Loading states and interaction
feedback MUST satisfy the Doherty Threshold (instant feedback with no perceived delay),
per `docs/00-context/content-inventory.md` which explicitly requires it on the public
order tracking page (`/track`).

### V. Containerized Development & Hot Reloading Discipline
Docker and Docker Compose are the canonical local development environment, using
multi-stage builds (`backend/Dockerfile`, `frontend/Dockerfile`). The `development`
stage is targeted in `docker-compose.yml`. Hot-reloading operates via bind mounts
(`./backend` and `./frontend` → `/app`). `make` is the primary entry point.

**Rollback Rule**: If hot-reload breaks for any developer after a `docker-compose.yml`
change, the change MUST be reverted via `git revert` — never patched forward under
pressure.

## Coding Standards & Code Quality

- **Checkstyle Enforcement**: All Java backend code MUST pass Checkstyle without
  violations (severity: warning, configured in `backend/checkstyle.xml`). No unused,
  redundant, or illegal imports. Boolean expressions must be simplified. Braces required
  on all control structures.
- **File Length**: Java source files MUST NOT exceed **500 lines**.
- **Line Length**: Source lines MUST NOT exceed **300 characters**.
- **Nesting Depth**: `for`/`if` nesting MUST NOT exceed **3 levels**.
- **Controllers Must Be Thin**: Controller methods MUST be fewer than 10 lines;
  business logic belongs in the service layer.
- **No Hardcoded Values**: Pricing rates (base price, kg limit, extra-minute rate) MUST
  be read from the `service_rates` table — never hardcoded in source.

## Credential & Security Rules

- **No Hardcoded Credentials**: Credentials MUST NEVER be hardcoded in source control.
  All secrets MUST be provided via environment variables (root `.env` file, gitignored).
- **Dev Seed Users**: Development seed accounts (Admin, Staff) are created only by
  Flyway migration `V2__seed_users.sql` when `SPRING_PROFILES_ACTIVE=dev` and all four
  `SEED_*` environment variables are set.
- **BCrypt Cost Factor**: Use cost factor **10** for development/test environments
  (faster iteration). Production deployments MUST use cost factor **12–14**.
- **Production Discipline**: Production MUST NOT activate the `dev` Spring profile.
  Admin accounts in production MUST be created through the application's user management
  interface with strong, unique passwords.

## Pull Request & Branching Workflow

- **Branch Base**: All feature branches MUST be cut from and target `develop`.
- **Branch Naming**: Branches MUST use prefixes: `feat/`, `fix/`, `refactor/`, `docs/`,
  `chore/` (e.g., `feat/order-cancellation`, `fix/cors-403`).
- **Commit Messages**: All commits MUST conform to [Conventional Commits](https://www.conventionalcommits.org/).
- **Local Verification**: Before opening a PR, tests MUST pass locally:
  - `make test-backend` (Maven compile + unit tests)
  - `make test-frontend` (lint + typecheck + vitest)
- **Review**: PRs MUST request review from `@markalvincadangin`. CI (GitHub Actions)
  must pass before merge.

## Source of Truth Map

| Question | Authoritative Source |
|---|---|
| What features to build? | `docs/02-requirements/user-stories.md` |
| What rules must the system enforce? | `docs/02-requirements/business-rules.md` |
| What does the database look like? | `docs/04-data-design/erd.dbml` |
| What are the API endpoints? | `docs/05-tech-design/openapi.yaml` |
| How is the system structured? | `docs/05-tech-design/architecture.md` (ARCH-001) |
| What does the UI look like? | `docs/05-tech-design/frontend-design-spec.md` |
| Non-functional rules? | `docs/02-requirements/non-functional-requirements.md` |
| What's in/out of scope? | `docs/01-scope/project-scope.md` |
| How do we deploy? | `docs/06-implementation/deployment-guide.md` |
| Why does the client need this? | `docs/00-context/case-study.md` |

## Governance

- This Constitution supersedes all other development practices and tribal knowledge.
- All PRs and code reviews MUST verify compliance with this Constitution.
- Amendments require documentation, explicit rationale, and an accompanying migration plan
  if existing code is affected.
- Constitution versioning follows SemVer:
  - **MAJOR**: Backward-incompatible principle removals or redefinitions.
  - **MINOR**: New principles or sections added.
  - **PATCH**: Clarifications, wording fixes, non-semantic refinements.

**Version**: 1.1.0 | **Ratified**: 2026-07-05 | **Last Amended**: 2026-07-05
