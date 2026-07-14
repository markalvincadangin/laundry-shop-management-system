# Quickstart & Verification Guide: Codebase Polish & Compliance

This guide describes how to run validation checks to verify checkstyle compliance, test correctness, and frontend linting.

## Prerequisites
- JDK 21
- Node.js v18+
- Maven 3.8+

---

## 1. Test Verification (Phase A)

To run the full backend unit and integration test suite (including the corrected catalog service and controller tests):

```bash
cd backend
mvn test
```

Expected outcome:
- Build success.
- `Tests run: 95, Failures: 0, Errors: 0, Skipped: 0` (including `AuditLogPerformanceTest` passing dynamically).

---

## 2. Checkstyle Verification (Phase B)

To verify the backend meets the strict Checkstyle rules defined in the constitution:

```bash
cd backend
mvn checkstyle:check
```

Expected outcome:
- Build success.
- 0 violations found.

---

## 3. Frontend Lint & Test Verification (Phase C)

To verify the frontend JSX literal compliance and ensure zero regressions:

```bash
cd frontend
# Verify no JSX literal warnings
npm run lint

# Verify all Vitest unit tests pass
npm run test -- --run
```

Expected outcome:
- `npm run lint` exits 0 with no warnings.
- `npm run test` reports at least 72 passing tests.
