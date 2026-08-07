# Tasks: Remote Access Resilience

**Input**: Design documents in `specs/013-remote-access-resilience/`

**Tests**: Tests are required by the feature specification, plan, and acceptance criteria. Every TDD test task must be run and shown failing before its paired implementation task.

**Organization**: Tasks are grouped by user story. Shared deployment and API primitives are foundational because every remote story depends on them.

## Phase 1: Setup and Contract Baseline

**Purpose**: Establish the exact source inventory and test entry points before behavior changes.

- [X] T001 Run Graphify queries for API-controller, service-transaction, authentication, and installer relationships; record the mutation-route inventory and evidence in `specs/013-remote-access-resilience/contracts/api.md`.
- [X] T002 [P] Add API-base resolution tests in `frontend/src/tests/lib/api-client.test.ts` for development, standalone, and Vercel environment inputs.
- [X] T003 [P] Add a build-output inspection test/script in `frontend/src/tests/` that rejects a standalone artifact containing `http://localhost:8080/api`.
- [X] T004 [P] Add production-property validation tests in `backend/src/test/java/com/himotech/laundryms/config/SecurityPropertiesTest.java`.

## Phase 2: Foundational Deployment and API Safety

**Purpose**: Build the shared production contract that blocks all remote user stories until complete.

- [X] T005 Run T002–T004 and confirm the new tests fail before implementation.
- [X] T006 Implement `NEXT_DEPLOYMENT_TARGET` modes and the Vercel external rewrite in `frontend/next.config.mjs`.
- [X] T007 Implement tested API-base URL resolution in `frontend/src/lib/api-client.ts` so both production targets use relative `/api` and only development can use the local URL.
- [X] T008 Update installer frontend build invocations in `scripts/build-installer.ps1` and `scripts/build-installer.sh` to force `NEXT_DEPLOYMENT_TARGET=standalone` and `NEXT_PUBLIC_API_URL=/api`.
- [X] T009 Bind production Spring Boot to `127.0.0.1` and remove obsolete origin-pattern configuration in `backend/src/main/resources/application.yml`, `backend/src/main/resources/application-prod.yml`, and `scripts/installer.iss`.
- [X] T010 Normalize backend/frontend environment templates in `.env.example`, `frontend/.env.local.example`, and new `frontend/.env.standalone.example`.
- [X] T011 Add focused failing no-store and explicit filter-order coverage for health, login, refresh, protected reads, mutations, and errors in `backend/src/test/java/com/himotech/laundryms/config/ApiCacheControlFilterTest.java`.
- [X] T012 Run T011 and confirm it fails before implementation, then add the Spring-managed `ApiCacheControlFilter` with explicit `@Order` in `backend/src/main/java/com/himotech/laundryms/config/ApiCacheControlFilter.java`.
- [X] T013 Run the T002–T004 and T011 suites plus both frontend builds; confirm the standalone output contains no production localhost API base.

**Checkpoint**: The dual-build, localhost-only, environment, and non-cacheable API foundations are verified. No user-story implementation begins until this checkpoint passes.

## Phase 3: User Story 1 — Know Whether the Shop System Is Available (Priority: P1) 🎯 MVP

**Goal**: A remote visitor always receives an understandable online or offline state from the Vercel-hosted application.

**Independent Test**: Stop the upstream while the public frontend remains deployed; initial load shows offline within five seconds. Restore it and verify recovery; disconnect it mid-session and verify writes become unavailable.

- [X] T014 [P] [US1] Write availability-state tests for initial probe failure, timeout, recovery, and browser reconnect in `frontend/src/tests/lib/availability.test.ts`.
- [X] T015 [P] [US1] Write provider/UI tests for the initial offline screen, stale-data banner, retry action, and disabled-write state in `frontend/src/tests/components/system/AvailabilityProvider.test.tsx`.
- [X] T016 [US1] Run T014–T015 and confirm they fail before availability implementation.
- [X] T017 [US1] Implement the health probe, five-second deadline, online/offline/checking state, and retry policy in `frontend/src/lib/availability.ts`.
- [X] T018 [US1] Implement `AvailabilityProvider` and wire it into `frontend/src/app/providers.tsx`.
- [X] T019 [P] [US1] Define all availability UI copy in `frontend/src/constants/ui/remote-access.ts` and implement `OfflineScreen` and `AvailabilityBanner` in `frontend/src/components/system/OfflineScreen.tsx` and `frontend/src/components/system/AvailabilityBanner.tsx` using those constants.
- [X] T020 [US1] Guard common mutation controls with the provider’s write-enabled state in `frontend/src/components/features/` and shared form/action components discovered by T001.
- [X] T021 [US1] Run the focused availability suite, `npm run typecheck`, `npm run lint`, and `npm run test` from `frontend/`.

**Checkpoint**: The Vercel UI can report upstream loss safely before any remote business write is enabled.

## Phase 4: User Story 2 — Use the Same System Remotely (Priority: P1)

**Goal**: Remote customers can track orders and remote Staff/Admin users can use their existing role-authorized experience while the laptop host is online.

**Independent Test**: From a separate network through a non-production Vercel/Ngrok route, track an order, sign in as Staff/Admin, and verify existing role boundaries.

- [X] T022 [P] [US2] Add proxy-focused authentication tests in `backend/src/test/java/com/himotech/laundryms/auth/AuthControllerTest.java` for secure Lax host-only refresh cookies, CSRF bootstrap, refresh, and logout.
- [X] T023 [P] [US2] Add Vercel rewrite configuration coverage in `frontend/src/tests/next-config.test.ts` for a HTTPS upstream and rejection of missing/non-HTTPS Vercel upstreams.
- [X] T024 [US2] Run T022–T023 and confirm failures before the session/proxy implementation changes.
- [X] T025 [US2] Update the tested production `Secure`, host-only, `SameSite=Lax` cookie policy and exact-origin CORS behavior in `backend/src/main/java/com/himotech/laundryms/auth/api/AuthController.java`, `backend/src/main/java/com/himotech/laundryms/config/SecurityConfig.java`, and `backend/src/main/resources/application-prod.yml` without weakening `CsrfDoubleSubmitFilter` in `backend/src/main/java/com/himotech/laundryms/auth/CsrfDoubleSubmitFilter.java`.
- [X] T026 [US2] Add production environment validation for `UPSTREAM_API_URL` and preview isolation in `frontend/next.config.mjs` and `docs/06-implementation/deployment-guide.md`.
- [ ] T027 [US2] Execute a non-production Vercel/Ngrok acceptance test recorded in `specs/013-remote-access-resilience/quickstart.md`: tracking, Staff/Admin RBAC, login, refresh, logout, `Set-Cookie`, CSRF, and protected calls.

**Checkpoint**: The proxy cookie integration evidence is reviewed and the remote authenticated/public flows work without exposing the upstream address to browser configuration.

## Phase 5: User Story 3 — Recover Safely From an Interrupted Change (Priority: P1)

**Goal**: A remote interruption cannot produce a duplicate order, payment, transition, or other business mutation.

**Independent Test**: Interrupt representative requests after backend commit, then explicitly recover with the same key and prove a single business result exists; changed request reuse returns 409.

- [ ] T028 [P] [US3] Write failing Testcontainers integration coverage for reservation, replay, changed-request conflict, missing/invalid key, rollback, and concurrent same-key requests in `backend/src/test/java/com/himotech/laundryms/idempotency/IdempotencyIntegrationTest.java`.
- [ ] T029 [P] [US3] Write failing client tests for generated keys, one-key explicit retry, no automatic business retry, and `UnconfirmedOperationError` in `frontend/src/tests/lib/api-client.test.ts`.
- [ ] T030 [US3] Run T028–T029 and confirm failures before idempotency implementation.
- [ ] T031 [US3] Add the next Flyway migration and operation-recovery entity/repository in `backend/src/main/resources/db/migration/` and `backend/src/main/java/com/himotech/laundryms/idempotency/`.
- [ ] T032 [US3] Implement transaction-scoped key validation, reservation-before-mutation, completion-before-commit, replay, conflict, and expiry cleanup in `backend/src/main/java/com/himotech/laundryms/idempotency/`.
- [ ] T033 [US3] Map idempotency header errors and replay headers in `backend/src/main/java/com/himotech/laundryms/shared/exception/GlobalExceptionHandler.java`.
- [ ] T034 [US3] Annotate or route every inventory item from T001 through the transaction executor in `backend/src/main/java/com/himotech/laundryms/*/api/`, explicitly excluding auth, reads, and `POST /orders/preview`.
- [ ] T035 [US3] Implement mutation-key lifecycle and unconfirmed-operation behavior in `frontend/src/lib/api-client.ts`.
- [ ] T036 [US3] Wire explicit unconfirmed/retry UX and duplicate-submit prevention into order, payment, and status flows under `frontend/src/components/features/`, then all remaining mutation call sites from T001.
- [ ] T037 [US3] Run focused idempotency/frontend recovery tests and full `make test-backend`, frontend typecheck/lint/test suites.

**Checkpoint**: Matching retry returns the original response, altered reuse returns 409, failures roll back atomically, and no client path silently submits a new business operation.

## Phase 6: User Story 4 — Continue Working Locally During an Internet Outage (Priority: P2)

**Goal**: A tunnel or internet failure stops only remote use; the shop laptop remains usable locally.

**Independent Test**: Disconnect laptop internet or stop Ngrok; complete a permitted local workflow while remote Vercel users see offline.

- [ ] T038 [P] [US4] Add local-bind and standalone-build regression coverage in `backend/src/test/java/com/himotech/laundryms/config/` and `frontend/src/tests/`.
- [ ] T039 [US4] Update standalone server/installer configuration in `scripts/installer.iss`, `scripts/build-installer.ps1`, and `scripts/build-installer.sh` so the local static UI and `/api` path work without the tunnel.
- [ ] T040 [US4] Replace or explicitly restrict the dynamic development sharing behavior in `scripts/share.ps1` so it cannot be mistaken for the production Ngrok service workflow.
- [ ] T041 [US4] Perform and record the local-outage acceptance scenario in `specs/013-remote-access-resilience/quickstart.md` and `docs/06-implementation/remote-access-acceptance-checklist.md`.

**Checkpoint**: Internet/tunnel loss has no local business-operation dependency and produces only the remote offline state.

## Phase 7: Polish, Documentation, and Release Evidence

**Purpose**: Make the feature operable, repeatable, and ready for review.

- [ ] T042 [P] Add the operator acceptance checklist in `docs/06-implementation/remote-access-acceptance-checklist.md` covering startup, tunnel health, Vercel state, outage, recovery, cookies, and backup.
- [ ] T043 [P] Reconcile Ngrok/remote-access wording and environment instructions in `docs/05-tech-design/architecture.md`, `docs/05-tech-design/frontend-design-spec.md`, `docs/06-implementation/deployment-guide.md`, `docs/06-implementation/environment-manifest.md`, and `docs/06-implementation/handover-checklist.md`.
- [ ] T044 Regenerate OpenAPI types and verify the contract stays synchronized in `docs/05-tech-design/openapi.yaml` and `frontend/src/types/api.generated.ts`.
- [ ] T045 Run `git diff --check`, backend verify, frontend lint/typecheck/test/build, and every scenario in `specs/013-remote-access-resilience/quickstart.md`.
- [ ] T046 Review completed work against `specs/013-remote-access-resilience/spec.md`, `plan.md`, `contracts/api.md`, and the harness verification record before opening a PR.

## Dependencies & Execution Order

- Phase 1 → Phase 2 → Phases 3, 4, and 5.
- US1 and US2 depend on the dual-build safety foundation. US3 depends on the API-base foundation and may proceed alongside US1/US2 after Phase 2, but its frontend UX must integrate with US1’s availability provider.
- US4 depends on the standalone contract from Phase 2; its installer/script work can proceed alongside the backend portion of US3.
- Phase 7 depends on all desired user stories.

## Parallel Opportunities

- T002–T004 can proceed in parallel.
- T014 and T015, T022 and T023, T028 and T029, T038 and T040, and T042 and T043 touch separate files and may proceed in parallel.
- After Phase 2, backend idempotency (T028–T034) can proceed in parallel with frontend availability (T014–T021), subject to coordinated API contract review.

## Implementation Strategy

1. Complete the dual-build/no-store foundation and validate it first.
2. Deliver US1 as the first visible MVP: a truthful remote offline experience.
3. Validate US2’s real proxy session flow before treating remote access as production-ready.
4. Deliver US3 with strict TDD and transaction review; this is the highest data-integrity risk.
5. Complete US4, operational documentation, and the full acceptance record before release.
