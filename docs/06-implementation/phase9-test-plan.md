# Phase 9 — Authentication & RBAC MVP: Test Plan

> **Phase:** 9 — Authentication & RBAC MVP  
> **Source:** implementation-plan.md Phase 9, US-11

---

## 1) Phase 9 Test Strategy

### What SHOULD Be Tested

| Category | Scope | Rationale |
|----------|-------|-----------|
| **Auth API** | login, logout, me | Correct paths, request/response handling |
| **Login page** | Form submit, error display, redirect | Auth flow |
| **Nav** | Role-based links (Owner vs Staff), Sign In/Logout | RBAC UI |
| **AuthGuard** | Redirect unauthenticated, Staff blocked from /reports | Route protection |
| **Backend** | AuthController (existing) | Login, logout, me endpoints |

### What Should NOT Be Tested (Phase 9)

| Category | Reason |
|----------|--------|
| **E2E with real backend** | Use mocked APIs |
| **JWT token parsing** | Backend responsibility |
| **BCrypt hashing** | Backend responsibility |

---

## 2) Test Matrix

| What is tested | File | Type | Why |
|----------------|------|------|-----|
| authApi.login | auth.test.ts | unit | POST body, path |
| authApi.logout | auth.test.ts | unit | POST path |
| authApi.me | auth.test.ts | unit | GET path |
| LoginPage form | LoginPage.test.tsx | component | Submit, error |
| Nav Owner vs Staff | Nav.test.tsx | component | Daily Report link visibility |
| Nav Sign In / Logout | Nav.test.tsx | component | Auth state UI |
| AuthGuard redirect | AuthGuard.test.tsx | component | Unauthenticated → login |

---

## 3) Definition of Done (Testing)

- [x] Auth API module tested
- [x] Login page tested
- [x] Nav role-based UI tested
- [x] AuthGuard tested (renders children)
- [x] Backend AuthController tests pass
- [x] Build passes
