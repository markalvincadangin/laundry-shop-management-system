<!--
Sync Impact Report:
- Version change: 1.1.0 -> 1.2.0
- List of modified principles:
  - I. Feature-First Backend Organization: Generalized coupling exception from one named
       case to the full real scope (~13 cross-feature relationships confirmed by code scan).
       Added note that clientalert/ uses api/ subpackage for DTOs, not dto/.
  - II. Frontend App Router Layering & State: No change — confirmed accurate.
  - III. Polyglot Contract Sync: No change — confirmed accurate.
  - IV. UX Standards & Doherty Threshold: No change — confirmed accurate.
  - V. Containerized Development: No change — confirmed accurate.
- Modified sections:
  - Coding Standards: Restored NestedForDepth/NestedIfDepth max=3 (confirmed in
    checkstyle.xml via NestedForDepth + NestedIfDepth modules — previously removed
    due to wrong grep term). Added thin-controller as team convention.
  - Credential & Security Rules: Corrected seed gate mechanism (Flyway placeholder
    seed_environment=dev, not Spring profile directly). Softened BCrypt prod factor
    from MUST to SHOULD (policy intent, not code-enforced).
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

> **Exception — DTO location**: `clientalert/` places response DTOs and mappers in its
> `api/` subpackage rather than `dto/`. This is an accepted pattern for features where
> the API contract objects are tightly scoped to the HTTP layer.

**Acknowledged Coupling Exception**: This is a Spring Data JPA monolith at small scale.
Cross-feature coupling at the entity and repository layer is **broadly accepted** — not a
violation. A live code scan confirms ~13 cross-feature import relationships, including:
`orders/ → customers/, rates/, payments/, clientalert/, users/`;
`payments/ → orders/, customers/, users/`;
`clientalert/ → orders/, customers/`;
`reports/ → payments/`; `auditlog/ → users/, auth/`.
This is documented in `docs/05-tech-design/architecture.md` (ARCH-001) and MUST NOT
be re-refactored without an explicit architectural decision.

### II. Frontend App Router Layering & State
The Next.js frontend MUST follow a strict downward dependency direction:

- `app/` — can import from anywhere.
- `components/` — can import from `lib/`, `stores/`, `hooks/`, but NEVER from `app/`.
- `lib/` — contains pure TypeScript (API clients, Zod schemas, utilities) and MUST NOT
  import React components.

All API calls MUST go through `src/lib/api/` (e.g., `src/lib/api/orders.ts`) via the
`api-client.ts` fetch client — direct `fetch` calls inside components are
prohibited. Zod validation schemas live in `src/lib/validation/` (one file per domain:
`auth.ts`, `order.ts`, `customer.ts`). State management lives in `src/stores/` using
React Context API — despite the `-store.tsx` naming, Zustand is intentionally not used
(confirmed in the comment at the top of each store file).

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
- **Nesting Depth**: `for` and `if` blocks MUST NOT exceed **3 levels** of nesting
  (enforced by `NestedForDepth` and `NestedIfDepth` modules in `checkstyle.xml`, max=3).
- **Controllers Must Be Thin** *(team convention)*: Controller methods should delegate
  immediately to the service layer. Business logic in controllers is a code-review
  rejection criterion even though it is not a Checkstyle rule.
- **No Hardcoded Values**: Pricing rates (base price, kg limit, extra-minute rate) MUST
  be read from the `service_rates` table — never hardcoded in source.

## Credential & Security Rules

- **No Hardcoded Credentials**: Credentials MUST NEVER be hardcoded in source control.
  All secrets MUST be provided via environment variables (root `.env` file, gitignored).
- **Dev Seed Users**: Development seed accounts (Admin, Staff) are inserted by Flyway
  migration `V2__seed_users.sql`. The migration is gated by the Flyway placeholder
  `${seed_environment} = 'dev'` — it runs on all profiles but only inserts rows when
  that placeholder resolves to `dev`. All four `SEED_*` environment variables must also
  be non-empty (`SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD_HASH`, `SEED_STAFF_USERNAME`,
  `SEED_STAFF_PASSWORD_HASH`). See `docs/development-credentials.md` for setup.
- **BCrypt Cost Factor**: `SecurityConfig` hardcodes cost factor **10** for all
  environments. Production deployments SHOULD use a higher cost factor (12–14) — this
  requires overriding `SecurityConfig` or externalizing the value; it is a security
  recommendation, not currently code-enforced.
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

**Version**: 1.2.0 | **Ratified**: 2026-07-05 | **Last Amended**: 2026-07-05
