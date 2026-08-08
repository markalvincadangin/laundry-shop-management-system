<!--
Sync Impact Report:
- Version change: 1.5.0 -> 1.6.0
- List of modified principles:
  - Added new principle IX. Offline-First & Tunnel Deployment Architecture
- Modified sections:
  - Core Principles
- Templates requiring updates:
  - plan-template.md: ✅ in sync
  - spec-template.md: ✅ in sync
  - tasks-template.md: ✅ in sync
- Follow-up TODOs: None
-->

# Laundry Shop Management System Constitution

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
- `components/features/[feature-name]/` — Feature-First Organization applies to the frontend. All domain-specific UI components MUST reside within their respective feature folders.
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
   extra-minute rate, add-ons, rush pricing — per `docs/02-requirements/business-rules.md` BR-PR-01
   through BR-PR-06) MUST be computed exclusively by `OrderService`. **Never** hardcode
   or replicate pricing formulas on the frontend.

### IV. UX Standards & Doherty Threshold
All frontend changes MUST adhere to the UX standards documented in
`docs/00-context/content-inventory.md` (NN/g Framework). Loading states and interaction
feedback MUST satisfy the Doherty Threshold (instant feedback with no perceived delay),
per `docs/00-context/content-inventory.md` which explicitly requires it on the public
order tracking page (`/track`).

### V. Containerized Development & Hot Reloading Discipline
Docker and Docker Compose are the canonical local development environment, using
multi-stage builds (`backend/Dockerfile`, `frontend/Dockerfile`).

**Orchestration and Configuration:**
- **Makefile Orchestration**: The `Makefile` is the primary interface for environment orchestration (e.g., `make setup-env`, `make up-dev`, `make fresh`, `make backup`).
- **Clean Compose Structure**: The base `docker-compose.yml` MUST remain clean and focused on core services. Development-specific overrides (volume mounts for hot-reloading, host port forwards) MUST reside exclusively in `docker-compose.override.yml`.

**Rollback Rule**: If hot-reload breaks for any developer after a compose file
change, the change MUST be reverted via `git revert` — never patched forward under
pressure.

### VI. Physical Asset & Machine Management
Physical tracking (laundry machines) introduces strict concurrency requirements to avoid 
operational overlaps. The following rules MUST be maintained:
1. **Double-Assignment Prevention**: A machine MUST NOT be assigned to more than one active order in `WASHING` or `DRYING` states simultaneously. The backend MUST enforce this via `409 Conflict`.
2. **BR-MAC-01: Multi-Load Capacity Guarantee.** The system treats one (1) physical machine as covering exactly one (1) order load.
3. **BR-MAC-02: Assignment Flexibility.** Staff may assign up to N machines in parallel (up to the order's `totalLoads`), or use 1 machine repeatedly for the same order.
4. **BR-MAC-03: Hoarding Prevention.** An order MUST NEVER be assigned more unique machines than its computed `totalLoads`. Exceeding this limit results in a `400 Bad Request`.
5. **BR-MAC-04: Max Machine Limit.** The system supports a physical maximum of 50 active machines. Attempting to add more results in a `400 Bad Request`.
6. **Inventory UI Reality**: The UI MUST present machine availability honestly. Out of service machines or already-assigned machines must be displayed but heavily disabled to avoid operational blind spots.
7. **Resiliency**: If a machine breaks down mid-cycle, staff MUST be able to reassign the order to a different machine without altering the order's internal status lifecycle.

### VII. Graphify Knowledge Graph & Codebase Investigation
This project maintains a graphify knowledge graph at `graphify-out/`.
- Agents and developers SHOULD run `graphify query`, `graphify explain`, and `graphify path` commands to navigate and reason about cross-file, cross-service, and front-to-back relationships before initiating deep file-by-file reading or architectural changes.
- After cloning the repository, developers MUST run `graphify hook install` once, which will automatically set up git hooks to keep the graph current on every commit.

### VIII. Frontend React/Next.js Best Practices
All React/Next.js code MUST follow the Vercel React Best Practices rules (including App Router conventions, waterfall elimination, Suspense, and memoization discipline) as detailed in the Coding Standards section.

### IX. Offline-First & Tunnel Deployment Architecture
The system MUST operate on a zero-cost, offline-first deployment topology. The Spring Boot backend and PostgreSQL database MUST run locally on the shop's Windows machine. Customer online tracking and authenticated remote Admin/Staff access MUST be facilitated via a secure reverse tunnel (currently Ngrok; Cloudflare remains an optional installer alternative) connecting the Vercel frontend directly to the local machine. Background cloud database synchronization (e.g., Transactional Outbox Pattern) is strictly prohibited to avoid cloud hosting costs.

## Coding Standards & Code Quality

- **Type-Safe Configuration**: Strictly prefer `@ConfigurationProperties` over `@Value` for injecting properties. Always bind configuration via dedicated properties classes (e.g., `AppProperties`, `SecurityProperties`).
- **Filter Chain Ordering**: Always declare explicit execution orders for custom Spring Web and Security filters using `@Order` (e.g., `Ordered.HIGHEST_PRECEDENCE` or `Ordered.LOWEST_PRECEDENCE`). Do not rely on implicit default ordering.
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
- **Frontend UI Constants**: Hardcoded strings MUST NEVER be used inside React components.
  All UI copy MUST be extracted to `src/constants/ui/` and referenced via `UI_LABELS`.
  This is enforced by the `react/jsx-no-literals` ESLint rule.
- **Vercel React Best Practices**: All React/Next.js code MUST adhere to strict TypeScript mode and follow the rules defined in the `vercel-react-best-practices` skill:
  - App Router Conventions: Properly separate Server and Client Components; optimize resource fetching.
  - Waterfall Elimination: Pre-load queries or run them in parallel (`Promise.all`) to eliminate sequential rendering waterfalls.
  - Suspense & Error Boundaries: Wrap lazy-loaded components and heavy fetch trees in appropriate Suspense boundaries.
  - Memoization Discipline: Use `useMemo` and `useCallback` appropriately to prevent unnecessary child re-renders.
  - Verification: Reviewers (human or agent) MUST verify compliance before a task is marked complete.

## Credential & Security Rules

- **No Hardcoded Credentials**: Credentials MUST NEVER be hardcoded in source control.
  All secrets MUST be provided via environment variables (root `.env` file, gitignored).
- **Dev Seed Users**: Development seed accounts and demo data MUST NOT use hardcoded Java seeders or clutter the `.env` file with `SEED_*` variables. Instead, use a repeatable Flyway script (e.g., `R__demo_data.sql`) mapped exclusively to the `dev` migration location. This ensures seed data is tightly scoped to the `dev` Spring profile and never leaks into production.
- **BCrypt Cost Factor**: `SecurityConfig` hardcodes cost factor **10** for all
  environments. Production deployments SHOULD use a higher cost factor (12–14) — this
  requires overriding `SecurityConfig` or externalizing the value; it is a security
  recommendation, not currently code-enforced.
- **Production Discipline**: Production MUST NOT activate the `dev` Spring profile.
  Admin accounts in production MUST be created through the application's user management
  interface with strong, unique passwords.

## Pull Request & Branching Workflow

- **Branch Base**: All feature branches MUST be cut from and target `develop`.
- **Branch Naming**: Branches MUST use prefixes that reflect actual practice: `feature/`, `polish/`, `chore/`, `docs/`, `test/`, `appmod/`, `copilot/`, or `dependabot/`.
- **Commit Messages**: All commits MUST conform to [Conventional Commits](https://www.conventionalcommits.org/).
- **Local Verification**: Before opening a PR, tests MUST pass locally:
  - `make test-backend` (Maven compile + JUnit/Testcontainers)
  - `make test-frontend` (lint + typecheck + Vitest)
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

**Version**: 1.6.0 | **Ratified**: 2026-07-05 | **Last Amended**: 2026-07-21
