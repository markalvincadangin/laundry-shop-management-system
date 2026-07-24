# Tasks: Audit Log Standardization

**Input**: Design documents from `/specs/006-audit-log-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Review and verify existing Shadcn UI Sheet component availability in frontend
- [X] T002 Ensure Spring Data JPA auditing or test context dependencies are available in `pom.xml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T003 Create database schema migration in `backend/src/main/resources/db/migration/V5__audit_system_standardization.sql` (Creates `audit_logs` table, indexes, `BEFORE UPDATE/DELETE` exception trigger, and `AFTER INSERT/UPDATE/DELETE` redaction trigger)
- [X] T004 Create base `AuditLogResponse` DTO in `backend/src/main/java/com/himotech/laundryms/auditlog/dto/AuditLogResponse.java`
- [X] T005 [P] Create Zod schema `AuditLogSchema` in `frontend/src/lib/validation/audit.ts` to match the DTO

**Checkpoint**: Database triggers enforcing immutability and redaction are active.

---

## Phase 3: User Story 1 - Secure Audit Trail (Data Integrity) & Privacy

**Goal**: Ensure every action is logged transactionally and context (actor/IP) is captured, while enforcing read access.

**Independent Test**: Scenario 1 from quickstart (Verify Immutability via DB delete failure).

### Implementation for User Story 1 & 2

- [X] T006 [P] [US1] Create or update `AuditUserAspect` in `backend/src/main/java/com/himotech/laundryms/auditlog/aspect/AuditUserAspect.java` to inject HTTP Context (`SET LOCAL`)
- [X] T007 [P] [US1] Create `AuditLogRepository` in `backend/src/main/java/com/himotech/laundryms/auditlog/repository/AuditLogRepository.java`
- [X] T008 [US1] Implement `AuditLogService` in `backend/src/main/java/com/himotech/laundryms/auditlog/service/AuditLogService.java`
- [X] T009 [US1] Implement paginated `AuditLogController` in `backend/src/main/java/com/himotech/laundryms/auditlog/controller/AuditLogController.java` with `@PreAuthorize("hasAnyRole('ADMIN','OWNER')")`
- [X] T010 [US2] Implement FR-006 Viewer Access Auditing (self-audit log) in `backend/src/main/java/com/himotech/laundryms/auditlog/controller/AuditLogController.java`

**Checkpoint**: Backend API is ready to serve paginated and filtered audit logs securely.

---

## Phase 4: User Story 3 - High-Performance Investigation (Scalability & UX)

**Goal**: Admin UI with filtering and a master-detail drawer for complex JSON diffs.

**Independent Test**: Scenario 2 and 3 from quickstart (Frontend UX and Redaction verification).

### Implementation for User Story 3

- [X] T011 [P] [US3] Implement API client methods in `frontend/src/lib/api/audit.ts`
- [X] T012 [P] [US3] Create `AuditDiffDrawer` component in `frontend/src/components/audit-logs/AuditDiffDrawer.tsx` using Shadcn `Sheet`
- [X] T013 [P] [US3] Create `AuditLogsTable` component in `frontend/src/components/audit-logs/AuditLogsTable.tsx` with discrete filter controls
- [X] T014 [US3] Assemble main page in `frontend/src/app/(dashboard)/audit-logs/page.tsx` integrating Table and Drawer

**Checkpoint**: Admin dashboard successfully displays audit logs and JSON diffs.

---

## Phase 5: Polish & Validation

- [X] T015 [Polish] Implement backend integration tests (SC-003 Performance Validation + Transaction rollback tests)
- [X] T016 [Polish] Add missing indexes explicitly checking Postgres `pg_indexes`
- [X] T017 [Polish] Ensure global error handler suppresses SQL error details on failed rollback
- [X] T018 [Polish] Verify frontend gracefully handles 403 Forbidden for non-Admin users

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: All depend on Foundational phase
- **Polish (Final Phase)**: Depends on all user stories being complete

### Parallel Opportunities
- Zod schema (T005) and Backend DTO (T004) can be built in parallel
- Frontend UI components (T012, T013) can be built in parallel with Backend API (T009)
