---
description: "Task list template for feature implementation"
---

# Tasks: Offline-First Standalone System Transition

**Input**: Design documents from `.specify/specs/011-offline-first-standalone/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project builds cleanly before structural changes
- [x] T002 Add required Maven build plugins (`frontend-maven-plugin`, `maven-resources-plugin`) to `backend/pom.xml` for frontend integration and jpackage packaging

**Execution notes**: No special discipline required. Verify project builds before proceeding.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Setup core data models for `OutboxEvent` and `SyncStatus` in `backend/src/main/java/com/himotech/laundryms/sync/entity/`
- [x] T004 [REVIEW] Verify Spring Boot `@ConfigurationProperties` and `application.yml` for new sync properties and localhost binding.

**Checkpoint**: Foundation ready. Get human approval before starting user stories.

---

## Phase 3: User Story 1 - Database UUID Migration (Priority: P1) MVP

**Goal**: Transition all database primary keys to UUIDs and implement a clean-slate wiping strategy.
**Independent Test**: Execute `make test-backend` to verify Flyway migrations apply correctly and entity persistence works.

### Implementation for User Story 1

- [x] T005 [P] [US1] Rewrite `backend/src/main/resources/db/migration/V1__init.sql` to use `UUID DEFAULT gen_random_uuid()` for all tables.
- [x] T006 [P] [US1] Create `backend/src/main/resources/db/migration/V1.1__core_data.sql` to seed required service rates.
- [x] T007 [P] [US1] Update all JPA entities in `backend/src/main/java/com/himotech/laundryms/**/entity/` to use UUID type and UUID Generation strategy.
- [x] T008 [P] [US1] Update all repository interfaces in `backend/src/main/java/com/himotech/laundryms/**/repository/` to use UUID type.
- [x] T009 [P] [US1] Update all DTOs and Services to handle string-formatted UUIDs.
- [x] T009.1 [P] [US1] Update all frontend Zod schemas in `src/lib/validation/` to use `.string().uuid()` to match the backend DTO changes.
- [x] T010 [US1] [REVIEW] Validate that tests pass and UUID integration succeeds.

**Checkpoint**: User Story 1 fully functional and testable. Get human approval.

---

## Phase 4: User Story 2 - Transactional Outbox Pattern (Priority: P2)

**Goal**: Capture domain events locally and synchronize them asynchronously to the cloud.
**Independent Test**: Run application offline, create an order, verify pending outbox event, and observe successful sync upon simulated reconnection.

### Tests for User Story 2

> Write these tests FIRST. Verify they FAIL before implementation.

- [x] T011 [P] [TDD] [US2] Implement WireMock integration test for `SyncWorker` retries and exponential backoff in `backend/src/test/java/com/himotech/laundryms/sync/SyncWorkerTest.java`.

### Implementation for User Story 2

- [x] T012 [P] [US2] Implement `OutboxEventRepository` in `backend/src/main/java/com/himotech/laundryms/sync/repository/`.
- [x] T012.1 [P] [US2] Implement `OutboxService` in `backend/src/main/java/com/himotech/laundryms/sync/service/`.
- [x] T013 [US2] Refactor `OrderService` and `CustomerService` to publish events via the new `OutboxService` within the same transaction.
- [x] T014 [US2] Implement `SyncWorker` `@Scheduled` task to poll and push JSON payloads using HTTP POST and HMAC/JWT Authorization.
- [x] T015 [US2] [REVIEW] Review exponential backoff and error handling (max 5 retries) in `SyncWorker`.

**Checkpoint**: User Stories 1 AND 2 both work independently. Get human approval.

---

## Phase 5: User Story 3 - Next.js Static Export & Routing (Priority: P3)

**Goal**: Configure Next.js for static HTML/JS export and serve it embedded within the Spring Boot application.
**Independent Test**: Navigate to `http://localhost:8080/orders/1` or `http://<LAN-IP>:8080/orders/1` without Next.js dev server running and verify the page loads correctly.

### Implementation for User Story 3

- [x] T016 [P] [US3] Modify `frontend/next.config.mjs` to set `output: 'export'`.
- [x] T017 [P] [US3] Refactor `frontend/src/app/(dashboard)/customers/[id]/page.tsx` and `layout.tsx` to implement Server Component wrapper and `generateStaticParams()`.
- [x] T018 [P] [US3] Refactor `frontend/src/app/(dashboard)/orders/[id]/page.tsx` and `layout.tsx` to implement Server Component wrapper and `generateStaticParams()`.
- [x] T019 [US3] Implement `SpaRedirectFilter` in `backend/src/main/java/com/himotech/laundryms/config/` to route non-API paths to `index.html`.
- [x] T020 [US3] Update `SecurityConfig.java` to explicitly permit unauthenticated access to embedded static assets while securing API endpoints.

**Checkpoint**: User Stories 1, 2, AND 3 both work independently. Get human approval.

---

## Phase 6: User Story 4 - Windows Executable Packaging (Priority: P4)

**Goal**: Generate a `.msi` Windows installer for the bundled Spring Boot and PostgreSQL application.
**Independent Test**: Execute the `.msi` in a Windows Sandbox and verify successful silent installation and startup.

### Implementation for User Story 4

- [x] T021 [P] [US4] Create `scripts/setup_windows.ps1` to download, install, configure (`shared_buffers=128MB`), and register PostgreSQL as a Windows Service. Include rollback handling.
- [x] T022 [P] [US4] Create `scripts/build_standalone.ps1` to automate Maven build and utilize `jpackage` to create the `.msi` with bundled JRE (`-Xmx512m`).
- [x] T023 [US4] Update documentation in `README.md` to detail standalone installation steps.

**Checkpoint**: User Stories 1, 2, 3, AND 4 both work independently. Get human approval.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 Code cleanup and Checkstyle verification (`mvn checkstyle:check`).
- [x] T025 [P] Performance optimization and memory profiling verification on bundled JRE.
- [x] T026 [REVIEW] Security hardening review of JWT generation and `SecurityConfig`.
- [x] T027 Run full test suite — all frontend and backend tests must pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
  - US1 (UUID) must complete before US2 (Outbox) to provide correct UUID references.
  - US3 (Next.js) can run in parallel with US1/US2.
  - US4 (Packaging) depends on all other US completion.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Within Each User Story

1. Tests (if [TDD]) MUST be written and FAIL before implementation
2. Models before services
3. Services before endpoints
4. Core implementation before integration
5. [REVIEW] tasks pause for human review
6. Story complete before moving to next priority

### Parallel Opportunities

- All tasks marked [P] within the same phase can run in parallel
- Once Foundational phase completes, US1 and US3 can start in parallel

---

## Superpowers Execution

### Execution Discipline by Marker

- **[TDD]**: Follow RED-GREEN-REFACTOR.
- **[SUBAGENT]**: If `subagent-driven-development` skill is available, dispatch to a subagent. Otherwise: implement sequentially in the current session.
- **[REVIEW]**: Pause execution. Present completed work to user. Wait for explicit approval before continuing.
- **[P]**: Launch parallel tasks where possible using the Task tool.

### Checkpoint Protocol

At every phase boundary:
1. Summarize what was completed in this phase
2. Run applicable tests
3. Report test results
4. Ask user: "Phase [N] complete. Proceed to Phase [N+1]?"
5. Only continue after explicit user approval

---

## Phase 8: Convergence

- [x] T028 [US2] Implement HMAC/JWT signature generation in `SyncWorker` per `spec.md` (Sec 6) (`partial`: currently only sends a plaintext Bearer token)
