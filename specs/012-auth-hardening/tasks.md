# Tasks: Feature 012 Authentication & Session Hardening

**Input**: Design documents from `.specify/specs/012-auth-hardening/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Task Format

```
[ID] [markers] [Story] Description
```

**Markers**:
- **[P]**: Can run in parallel (different files, no dependencies)
- **[TDD]**: Must follow RED-GREEN-REFACTOR (write test → fail → implement → pass → refactor)
- **[REVIEW]**: Requires code review before proceeding to next task
- **[SUBAGENT]**: Can be delegated to a subagent for parallel execution

**Story labels**: `[US1]`, `[US2]`, `[US3]`, `[US4]` map tasks to user stories for traceability.

## Path Conventions

- **Backend**: `backend/src/main/java/com/himotech/laundryms/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify backend compiles and frontend builds successfully before making modifications

**Execution notes**: Ensure no existing broken state in `develop` branch before starting work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [TDD] Create Flyway migration script `backend/src/main/resources/db/migration/V2__add_refresh_tokens_table.sql`
- [x] T003 [P] Setup core data model `backend/src/main/java/com/himotech/laundryms/auth/domain/RefreshToken.java`
- [x] T004 [P] Implement repository interface `backend/src/main/java/com/himotech/laundryms/auth/repository/RefreshTokenRepository.java`

**Checkpoint**: Foundation ready. Get human approval before starting user stories.

---

## Phase 3: User Story 1 - Secure Authentication & Memory Access Token Usage (Priority: P1)

**Goal**: Establish 15-minute access token limit and HttpOnly refresh token delivery while storing tokens only in frontend memory.
**Independent Test**: Login returns short-lived JWT and sets HttpOnly cookies; tokens do not appear in `localStorage`.

### Implementation for User Story 1

- [x] T005 [P] [US1] Update `backend/src/main/java/com/himotech/laundryms/auth/security/JwtTokenProvider.java` to reduce expiration to 15m, configure 30-60 seconds of clock skew leeway, and omit PII.
- [x] T006 [P] [US1] Update `frontend/src/lib/validation/auth.ts` Zod schema to reflect `{ accessToken, expiresIn }`.
- [x] T007 [US1] Modify `backend/src/main/java/com/himotech/laundryms/auth/service/AuthService.java` `login` method to generate access token, opaque refresh token, persist it, and set secure cookies.
- [x] T008 [US1] Update `backend/src/main/java/com/himotech/laundryms/auth/controller/AuthController.java` `login` endpoint response shape.
- [x] T009 [P] [US1] Refactor `frontend/src/stores/auth-store.tsx` to hold the access token purely in React Context (removing persistence logic).
- [x] T010 [US1] Update `frontend/src/lib/api/api-client.ts` to pull access token from `auth-store` and attach to `Authorization` header.

**Checkpoint**: User Story 1 fully functional and testable. Login works, token in memory, cookies in browser. Get human approval.

---

## Phase 4: User Story 2 - Transparent Token Refresh & Rotation with Reuse Detection (Priority: P1)

**Goal**: Implement secure refresh endpoint with CSRF protection, token rotation, and compromise detection logic; frontend transparently refreshes on 401.
**Independent Test**: Wait 15 mins (or force expiry), trigger API call, verify silent refresh occurs seamlessly and old token is invalidated.

### Tests for User Story 2

> Write these tests FIRST. Verify they FAIL before implementation.

- [ ] T011 [TDD] [US2] Write unit/integration tests for `AuthService` rotation and reuse detection (family-wide revocation) in `backend/src/test/java/com/himotech/laundryms/auth/service/AuthServiceTest.java`.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Implement `backend/src/main/java/com/himotech/laundryms/auth/security/CsrfDoubleSubmitFilter.java` for CSRF validation on cookie endpoints.
- [ ] T013 [US2] Implement `AuthService.java` `refresh` logic (validate hash, check revocation, rotate token, detect reuse).
- [ ] T014 [US2] Implement `AuthController.java` `refresh` endpoint logic.
- [ ] T015 [US2] [REVIEW] Add 401 interceptor logic to `frontend/src/lib/api/api-client.ts` to attempt silent refresh via `POST /api/v1/auth/refresh` sending `credentials: 'include'` and `X-CSRF-Token` header.
- [ ] T016 [P] [US2] Update `frontend/src/stores/auth-store.tsx` to perform silent refresh on initial application mount to restore session.

**Checkpoint**: User Stories 1 AND 2 both work independently. Get human approval.

---

## Phase 5: User Story 3 - Secure Logout & Event-Driven Session Revocation (Priority: P2)

**Goal**: Allow manual logout to revoke tokens server-side and trigger auto-revocation on critical account changes.
**Independent Test**: Call `/logout`, verify token row is marked revoked. Attempt refresh, verify 401.

### Implementation for User Story 3

- [ ] T017 [P] [US3] Implement `logout` method in `AuthService.java` to mark token as revoked and clear cookies.
- [ ] T018 [US3] Implement `logout` endpoint in `AuthController.java`.
- [ ] T019 [US3] Add `revokeAllUserTokens(UUID userId)` method to `AuthService.java` and invoke it from `UserService.java` (where password/role changes occur).
- [ ] T020 [US3] Update frontend logout action in `auth-store.tsx` to call API logout endpoint (attaching the `X-CSRF-Token` header) before clearing state.

**Checkpoint**: User Story 3 works independently. Logout completely kills session capability.

---

## Phase 6: User Story 4 - Username-Keyed Brute-Force Lockout & Non-Disclosure (Priority: P2)

**Goal**: Block repetitive login failures per username while hiding lockout status from potential enumerators.
**Independent Test**: 5 failed logins lock the account. 6th attempt (even correct) returns generic error.

### Tests for User Story 4

- [ ] T021 [P] [TDD] [US4] Write unit tests for `LoginAttemptService` lockout limits and timing in `backend/src/test/java/com/himotech/laundryms/auth/service/LoginAttemptServiceTest.java`.

### Implementation for User Story 4

- [ ] T022 [US4] Implement `backend/src/main/java/com/himotech/laundryms/auth/service/LoginAttemptService.java` using `ConcurrentHashMap` for in-memory tracking of attempts per username.
- [ ] T023 [US4] Integrate `LoginAttemptService` into `AuthService.java` `login` method: check lock BEFORE checking password; increment on fail, reset on success; throw standard `BadCredentialsException` if locked.

**Checkpoint**: User Story 4 complete. Brute force properly mitigated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T024 Code cleanup and refactoring in `auth` package (ensure Checkstyle compliance, no unused imports).
- [ ] T025 Execute manual cURL validation scripts documented in `quickstart.md`.
- [ ] T026 [REVIEW] Run full test suites (`make test-backend` and `make test-frontend`) to ensure no regressions.
- [ ] T027 [SUBAGENT] Implement a Spring `@Scheduled` job to periodically prune expired tokens from the `refresh_tokens` table.
- [ ] T028 Update `docs/05-tech-design/openapi.yaml` to reflect the new `/api/v1/auth/refresh` endpoint, the modifications to `LoginResponse`, and the introduction of the `X-CSRF-Token` header.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-6)**: Depend on Foundational completion. Phase 3 & 4 must be done sequentially as Phase 4 relies on Phase 3's core setup. Phase 5 & 6 can be done in parallel or sequentially.
- **Polish (Final Phase)**: Depends on all user stories being complete

### Within Each User Story

1. Tests (if [TDD]) MUST be written and FAIL before implementation
2. Models before services
3. Services before endpoints
4. Core implementation before integration
5. [REVIEW] tasks pause for human review
6. Story complete before moving to next priority

### Parallel Opportunities

- All tasks marked [P] within the same phase can run in parallel
- Frontend schema/store logic can often be developed simultaneously with backend logic.

---

## Superpowers Execution

### Execution Discipline by Marker

- **[TDD]**: Follow RED-GREEN-REFACTOR. Write test → run (must fail) → implement → run (must pass) → refactor if needed.
- **[SUBAGENT]**: Can be dispatched to a subagent if the capability exists.
- **[REVIEW]**: Pause execution. Present completed work to user. Wait for explicit approval before continuing.
- **[P]**: Parallel candidate.

### Checkpoint Protocol

At every phase boundary:
1. Summarize what was completed in this phase
2. Run applicable tests (backend JUnit, frontend Vitest)
3. Report test results
4. Ask user: "Phase [N] complete. Proceed to Phase [N+1]?"
5. Only continue after explicit user approval

---

## Notes

- [P] tasks = different files, no dependencies
- [TDD] tasks = strict RED-GREEN-REFACTOR discipline
- [REVIEW] tasks = human review gate
- [Story] label maps task to specific user story for traceability
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
