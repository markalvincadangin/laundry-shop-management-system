# Implementation Tasks: Codebase Polish & Compliance

**Spec**: [spec.md](file:///home/markc/projects/web-dev/laundry-shop-management-system/specs/009-codebase-polish/spec.md)
**Status**: Ready for execution

---

## Dependencies
- Phase 1 (Setup) must be completed before starting Phase 3 (Checkstyle Compliance).
- Phase 2 (User Story 2 - Test Correctness) can be executed first in parallel with Phase 1.
- Phase 3 (Checkstyle Compliance) and Phase 4 (UI Constants Cleanup) can run in parallel after Phase 1 and Phase 2 are complete.

---

## Phase 1: Setup & Prerequisites
*Goal: Configure Checkstyle rules and plugin scope per Constitution standards.*
*Verification: Maven checkstyle configurations are active.*

- [x] T001 Verify `LineLength` is set to 300 in `backend/checkstyle.xml`
- [x] T002 Add suppression rule for `DesignForExtension` on Spring-annotated classes in `backend/checkstyle-suppressions.xml`
- [x] T003 Exclude target directory `target/generated-sources` in `backend/pom.xml`

---

## Phase 2: User Story 2 - Fix Broken Tests (Priority: P1)
*Goal: Resolve all compilation and assertion errors in backend tests.*
*Verification: Running `mvn test` succeeds without test failures.*

- [x] T004 [US2] Update `AddOnCatalogServiceTest.java` request mappings to use setters instead of undefined all-args constructors, and align method calls to actual `AddOnCatalogService` API (`getAll()` and `getAllActive()`).
- [x] T005 [US2] Update `AddOnCatalogControllerTest.java` to construct response objects using `AddOnCatalogResponse.builder()`, and align `id` types.
- [x] T006 [US2] Update `AuditLogPerformanceTest.java` to implement dynamic degradation threshold `mean + 2 * stddev` across 10 measured iterations.
- [x] T007 [US2] Run `mvn test` to verify all backend tests pass.

---

## Phase 3: User Story 1 - Backend Checkstyle Compliance (Priority: P1)
*Goal: Systematically resolve all modifier, braces, newline, and Javadoc violations.*
*Verification: `mvn checkstyle:check` reports 0 violations.*

> ⚠️ **Intermediate State Note**: Formatting passes (T008–T014) may expose new Javadoc or class extension violations. Run Checkstyle checks only at T020 after Javadoc fixes (T015–T019) are fully complete.

- [x] T008 [P] [US1] Add braces to single-line control structures (`NeedBraces`) in `backend/src/main/java/com/himotech/laundryms/orders/**/*.java`
- [x] T009 [P] [US1] Add braces to single-line control structures (`NeedBraces`) in `machines/**/*.java`, `rates/**/*.java`, and `auth/**/*.java`
- [x] T010 [P] [US1] Add braces to single-line control structures (`NeedBraces`) in remaining packages (`customers/`, `users/`, `reports/`, `config/`, `shared/`, `auditlog/`)
- [x] T011 [P] [US1] Fix file newline terminations (`NewlineAtEndOfFile`) across all backend source files in `backend/src/main/java/**/*.java`
- [x] T012 [P] [US1] Add `final` parameter modifiers (`FinalParameters`) in `orders/**/*.java`
- [x] T013 [P] [US1] Add `final` parameter modifiers (`FinalParameters`) in `machines/**/*.java`, `rates/**/*.java`, and `auth/**/*.java`
- [x] T014 [P] [US1] Add `final` parameter modifiers (`FinalParameters`) in remaining packages (`customers/`, `users/`, `reports/`, etc.)
- [x] T015 [P] [US1] Add class/method Javadocs and final class modifiers in `config/**/*.java` and `shared/**/*.java`
- [x] T016 [P] [US1] Add class/method Javadocs and final class modifiers in `users/**/*.java` and `auth/**/*.java`
- [x] T017 [P] [US1] Add class/method Javadocs and final class modifiers in `orders/**/*.java`
- [x] T018 [P] [US1] Add class/method Javadocs and final class modifiers in `machines/**/*.java` and `rates/**/*.java`
- [x] T019 [P] [US1] Add class/method Javadocs and final class modifiers in `reports/**/*.java`, `auditlog/**/*.java`, and `customers/**/*.java`
- [x] T020 [US1] Run `mvn checkstyle:check` to verify zero remaining violations.

---

## Phase 4: User Story 3 - Frontend UI Constants Cleanup (Priority: P2)
*Goal: Extract all hardcoded UI text to constants to satisfy ESLint constraints.*
*Verification: `npm run lint` reports 0 `react/jsx-no-literals` warnings.*

- [x] T021 [US3] Audit current JSX literal warnings by running `npm run lint 2>&1 | grep jsx-no-literals` and log locations
- [x] T022 [P] [US3] Extract hardcoded strings to `UI_LABELS` modules in `frontend/src/app/(dashboard)/rates/**/*.tsx` and `reports/**/*.tsx`
- [x] T023 [P] [US3] Extract hardcoded strings to `UI_LABELS` modules in `frontend/src/app/(dashboard)/machines/**/*.tsx` and `overview/**/*.tsx`
- [x] T024 [P] [US3] Extract hardcoded strings to `UI_LABELS` in components folders `frontend/src/components/features/**/*.tsx`
- [x] T025 [P] [US3] Extract hardcoded strings to `UI_LABELS` in remaining dashboard views (`customers/`, `users/`, `orders/`)
- [x] T026 [US3] Run `npm run lint` and verify 0 warnings, and `npm run test` to verify 72 passing tests baseline.

---

## Phase 5: Polish & Final Validation
*Goal: Final end-to-end codebase quality gate checks.*
*Verification: Both frontend and backend compile, format, and test successfully.*

- [x] T027 Run `mvn test` (0 failures)
- [x] T028 Run `mvn checkstyle:check` (0 violations)
- [x] T029 Run `npm run lint` (0 warnings)
- [x] T030 Run `npm run test` (all 72+ Vitest tests pass)
- [x] T031 [Bugfix BUG-001] Fix `make test-backend` by configuring Testcontainers DIND support in `docker-compose.yml`

## Phase 6: Convergence

- [x] T032 Replace barrel imports in frontend/src/components/features/rates/AddOnCatalogModal.tsx and AddOnCatalogList.tsx with direct imports per Constitution Principle VIII (`bundle-barrel-imports`) (contradicts)
- [x] T033 Replace `&&` conditional render with ternary in frontend/src/components/features/rates/AddOnCatalogList.tsx per Constitution Principle VIII (`rendering-conditional-render`) (contradicts)
