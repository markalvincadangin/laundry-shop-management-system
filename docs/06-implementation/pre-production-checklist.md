# Pre-Production Checklist — Faith Laundry Shop Management System

> **Phase:** 13 — Final Scan & Pre-Production Checklist  
> **Branch:** `chore/final-scan-pre-production`  
> **Purpose:** Comprehensive scan before deployment. Ensures no secrets, no debug code, no broken links, and full traceability.

---

## Code & Build

| Check | Command | Status |
|-------|---------|--------|
| Backend tests pass | `.\mvnw.cmd clean test` | ✅ |
| Backend package produces JAR | `.\mvnw.cmd package` | ✅ |
| Frontend build succeeds | `npm run build` | ✅ |
| Frontend typecheck passes | `npm run typecheck` | ✅ |
| Frontend lint passes (zero errors) | `npm run lint` | ✅ |
| No `console.log` in frontend | Manual scan | ✅ |
| No `System.out` in production paths | Manual scan | ✅ |
| No debug breakpoints | Manual scan | ✅ |
| No critical TODO/FIXME unaddressed | Manual scan | ✅ |

---

## Security & Configuration

| Check | Verification | Status |
|-------|--------------|--------|
| No secrets in code | No API keys, passwords hardcoded | ✅ |
| `.env`, `.env.local` in `.gitignore` | Verify exclusion | ✅ |
| Only `.env.example` committed | No `.env` in repo | ✅ |
| Production config uses env vars | `application.yml` uses `${VAR}` | ✅ |
| CORS configured for production | `ALLOWED_ORIGIN` env var | ✅ |
| JWT secret from environment | `JWT_SECRET` env var | ✅ |

---

## Documentation

| Check | Verification | Status |
|-------|--------------|--------|
| README reflects setup | Current run instructions | ✅ |
| All `/docs` links valid | No broken references | ✅ |
| OpenAPI spec matches endpoints | Compare with controllers | ✅ |
| ERD/schema matches migrations | Compare with Flyway | ✅ |
| Implementation plan phase status | Accurate | ✅ |

---

## Traceability

| Check | Verification | Status |
|-------|--------------|--------|
| User stories (US-xx) traceable | Features implemented | ✅ |
| Business rules (BR-xx) enforced | Documented in code | ✅ |
| Known limitations documented | Release notes | ✅ |

---

## Polish

| Check | Verification | Status |
|-------|--------------|--------|
| Error messages user-friendly | No stack traces to users | ✅ |
| Loading states handled | Skeleton/loading UI | ✅ |
| Empty states handled | "No data" graphics | ✅ |
| Accessibility basics | Keyboard nav, labels | ✅ |

---

## Verification Commands (Quick Reference)

```powershell
# Backend (from backend/)
.\mvnw.cmd clean test
.\mvnw.cmd package

# Frontend (from frontend/)
npm run build
npm run typecheck
npm run lint
```

**Note:** Backend tests require Java 21 (per project stack). If using Java 25+, JaCoCo 0.8.13+ supports it. For CI, `backend-ci.yml` uses JDK 21.

---

## Sign-Off

- [x] All checks passed
- [ ] PR created: `chore: Final scan, fixes, and polish before production deployment`
- [ ] Ready for Phase 14 — Production Deployment

---

## Phase 13 Execution Summary

**Completed:** 2026-02-17

**Changes made:**
- Added this pre-production checklist document
- Removed `System.out.println` debug statements from `AbstractIntegrationTest.java`
- Updated docs README index with pre-production checklist, deployment guide, and release notes
- Linked pre-production checklist in implementation plan Phase 13

**Final scan (2026-02-17):**
- Set `show-sql: false` in `application.yml` (production-safe default; dev profile overrides)
- Added `application-prod.yml` for explicit production JPA/logging settings
- Fixed PostgreSQL 42P18 (OrderRepository): replaced `(:param IS NULL OR col = :param)` with JPA Specifications
- JaCoCo 0.8.13 in use (supports Java 21–25)
