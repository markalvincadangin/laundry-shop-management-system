# Phase 11 — Hardening & Developer Experience: Test Plan

> **Phase:** 11 — Hardening & Developer Experience (MVP)  
> **Source:** implementation-plan.md Phase 11

---

## 1) Phase 11 Test Strategy

### What SHOULD Be Tested

| Category | Scope | Rationale |
|----------|-------|-----------|
| **Orders API** | list with pagination, status, paymentStatus, from, to | Phase 11 pagination & filtering |
| **Payments API** | list with pagination, from, to | Phase 11 pagination & filtering |
| **Orders page** | Pagination UI, filters, fetch with params | Phase 11 UI integration |
| **Backend** | OrderController list params, PaymentController list params | API contract |
| **CI** | mvn verify (Checkstyle, JaCoCo), npm run lint/test/build | Quality gates |

### What Should NOT Be Tested (Phase 11)

| Category | Reason |
|----------|--------|
| **Logback config** | Config-only, no logic |
| **Docker Compose** | Optional, infra |
| **Deployment guide** | Documentation |

---

## 2) Test Matrix

| What is tested | File | Type | Why |
|----------------|------|------|-----|
| ordersApi.list with date range & paymentStatus | orders.test.ts | unit | Phase 11 filter params |
| paymentsApi.list with pagination & date range | payments.test.ts | unit | Phase 11 pagination/filters |
| OrdersPage pagination & filters | OrdersPage.test.tsx | component | Phase 11 UI |
| OrderController list params | OrderControllerTest | backend | API contract |
| PaymentController list params | PaymentControllerTest | backend | API contract |
| mvn verify | backend-ci.yml | CI | Checkstyle, JaCoCo |
| npm run lint/test/build | frontend-ci.yml | CI | ESLint, tests |

---

## 3) Definition of Done (Testing)

- [x] Orders API list tested with date range and paymentStatus params
- [x] Payments API list tested with pagination and date range params
- [x] Orders page pagination and filter UI tested
- [x] Backend OrderController list params tested
- [x] Backend PaymentController list params tested
- [x] Backend mvn verify passes (Checkstyle, JaCoCo)
- [x] Frontend lint, test, build pass
