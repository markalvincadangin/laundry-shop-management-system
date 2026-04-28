# Implementation Status
## Faith Laundry Shop Management System

> **Source of truth:** [docs/](../) — scope, user stories, business rules, NFRs, OpenAPI, ERD  
> **Last scanned:** 2026-04-24  
> **Last updated:** 2026-04-24 (Frontend Modularity Refactor)  
> **Purpose:** Gap analysis of what is implemented vs. what is required per documentation

---

## 1. Implemented (per docs)

### 1.1 User stories (MVP)

| ID | User story | Backend | Frontend | Notes |
|----|------------|---------|----------|--------|
| US-01 | Record laundry order | ✅ | ✅ | Create order with customer, weight, extra minutes, add-ons; reference number; status RECEIVED |
| US-02 | Automatically compute laundry price | ✅ | ✅ | Preview + create; loads, base, extra minutes, add-ons, grand total (BR-PR-01–04) |
| US-03 | Update laundry order status | ✅ | ✅ | Status updates with audit trail (order_status_logs); BR-OL-03, BR-OL-04 (transitions) |
| US-04 | Track by reference number | ✅ | ✅ | Public `/track` page; GET `/api/v1/orders/reference/{ref}`; no auth |
| US-05 | Verify laundry before release | ✅ | ✅ | Release only when READY_FOR_PICKUP + Paid (BR-OL-05) enforced in OrderStatusService |
| US-06 | Record payment | ✅ | ✅ | One payment per order; amount = grand total; payment method (CASH/GCASH/BANK_TRANSFER); BR-PAY-02–05 |
| US-07 | View payment history | ✅ | ✅ | GET /payments (paginated, filtered); Admin-only in UI; Staff use order-level payment |
| US-08 | View daily sales report | ✅ | ✅ | Reports page (Admin only); daily income + completed orders; Using RevenueChart molecule |
| US-09 | View monthly and yearly income reports | ✅ | ✅ | Monthly/yearly reports; Admin only; Using RevenueChart molecule |
| US-10 | Notify customer when ready | ✅ (partial) | ✅ | Notification record on READY_FOR_PICKUP; list notifications; SMS stubbed (logs only) |
| US-11 | User login and role-based access | ✅ | ✅ | JWT in HTTP-only cookie; Admin vs Staff; reports/rates Admin-only in backend and frontend |

### 1.2 Business rules (MVP)

| Rule | Description | Status |
|------|-------------|--------|
| BR-PR-01 to BR-PR-04 | Pricing (base load, extra load, extra minutes, add-ons) | ✅ Enforced in OrderService |
| BR-PR-05 | Admin updates service rates | ✅ PATCH /service-rates/{id} Admin-only |
| BR-OL-01 | Unique reference number | ✅ DB unique + generation |
| BR-OL-02 | Initial status RECEIVED | ✅ |
| BR-OL-03 | Allowed status values | ✅ Enum validation |
| BR-OL-04 | Status transition control | ✅ OrderStatusService allowed transitions |
| BR-OL-05 | Release only if Ready for Pickup + Paid | ✅ |
| BR-OL-06 | Edit extra minutes/add-ons when unpaid and not released | ✅ PATCH order; rejected if released/paid |
| BR-PAY-02 to BR-PAY-05 | One payment per order; amount match; payment status; payment method | ✅ |
| BR-NOTIF-02 | Tracking by reference | ✅ |
| BR-NOTIF-01 | Notify on Ready for Pickup | ✅ Record created; SMS optional/stubbed |
| BR-REC-01 | Core data stored | ✅ ERD and migrations align |

### 1.3 API (OpenAPI)

| Endpoint | Implemented | Notes |
|----------|-------------|--------|
| GET /api/v1/health | ✅ | See “Missing” below |
| POST /api/v1/auth/login, logout; GET /me | ✅ | |
| GET/POST /api/v1/customers; GET /api/v1/customers/{id} | ✅ | No PATCH customer in spec; not required for MVP |
| GET /api/v1/service-rates, /active; PATCH /{rateId} | ✅ | |
| POST/GET /api/v1/orders; POST /preview; GET /stats, /{id}, /reference/{ref}; PATCH /{id}, /{id}/status | ✅ | |
| POST/GET /api/v1/payments; GET /{paymentId} | ✅ | |
| GET /api/v1/notifications | ✅ | |
| GET /api/v1/reports/sales/daily, monthly, yearly | ✅ | |

### 1.4 Data & infrastructure

| Item | Status |
|------|--------|
| ERD (erd.dbml) | ✅ V1/V2 migrations match: users, customers, service_rates, orders, order_add_ons, order_status_logs, payments, notifications |
| pgcrypto | ✅ Enabled in Docker init and V1 |
| Flyway | ✅ Embedded; migrations on startup |
| Docker (db, fullstack, prod) | ✅ docker-compose.yml, fullstack, prod with Nginx |
| Backup scripts | ✅ scripts/backup-database.sh, backup-database.ps1 |
| Deployment guide | ✅ Env, Docker, production, backup, HTTPS |
| User manual | ✅ docs/06-implementation/user-manual.md |
| Handover checklist | ✅ docs/06-implementation/handover-checklist.md |

### 1.5 Non-functional (summary)

| NFR | Status |
|-----|--------|
| NFR-S1–S5 | ✅ Auth (username/password), JWT, RBAC, tracking limited data, env-based secrets |
| NFR-S6 | ⚠️ Production checklist in deployment guide; operator must set strong JWT/DB password |
| NFR-P1–P2 | ✅ Concurrent use; pagination on orders and payments |
| NFR-A1, A2 | ✅ Deployable; backup script present |
| NFR-A3 | ✅ Restore procedure documented in deployment guide §6.5 — see “Missing” |
| NFR-T1–T3 | ✅ Status audit trail; payment linked to user; reports from payments |
| NFR-U1–U2 | ✅ User manual; core flows in place |
| NFR-M1–M4 | ✅ Docs (architecture, OpenAPI, ERD); Flyway; env config; deployment + handover docs |

---

## 2. Missing or to be implemented

### 2.1 API / contract

| Item | Doc reference | Action |
|------|----------------|--------|
| **GET /api/v1/health** | OpenAPI defines this (no auth). Backend only exposes **/actuator/health**. | Either add a simple controller for `GET /api/v1/health` returning 200 (and allow in SecurityConfig) or update OpenAPI and all references (README, deployment guide, frontend) to use `/actuator/health` as the canonical health check. |

### 2.2 Documentation / operations

| Item | Doc reference | Action |
|------|----------------|--------|
| **Restore procedure** | NFR-A3; deployment guide §6.4 (backup only). | Add a “Restore from backup” subsection to the deployment guide: how to restore from `laundry_db_YYYYMMDD_HHMMSS.sql.gz` (e.g. `gunzip -c file.sql.gz \| psql ...` or equivalent). |
| **Backup script env** | Backup scripts load `$PROJECT_ROOT/.env`. Project uses per-component env (e.g. `docker/.env.docker`, `backend/.env`). | Document in deployment guide that for backup, DB_* can be taken from `backend/.env` or `docker/.env.docker`, or set in environment when running the script. |

### 2.3 Optional / post-MVP (no implementation required for MVP)

| Item | Doc reference | Status |
|------|----------------|--------|
| US-10 full SMS | Notification sending is MVP-optional; storage + stub in place. | Implement when moving to post-MVP. |
| BR-OL-04 | Status transitions already enforced. | Done. |
| Partial payments / PARTIAL | Out of scope for MVP. | Post-MVP. |
| Receipt printing | Release notes – planned. | Post-MVP. |
| Dashboard charts | Integrated via `RevenueChart` organism | ✅ |
| Component Modularity | Extracted DataTable, Pagination, FilterBar, PageHeader | ✅ |
| implementation-plan.md | Removed from docs index (file not present). | Optional; add if phase-by-phase roadmap is needed. |

---

## 3. Summary

- **Implemented:** All MVP user stories (US-01–US-11), required business rules, **all** OpenAPI endpoints (including `GET /api/v1/health`), schema, auth/RBAC, Docker, backup scripts, deployment and handover documentation, **restore procedure**, and **backup script env** documentation.
- **To implement for full doc compliance:** None; all previously missing items have been implemented.
- **Optional / post-MVP:** SMS delivery, receipt printing, dashboard charts, implementation plan doc.

---

## 4. How to use this document

- **Development:** Use “Implemented” to confirm behavior; use “Missing” for small follow-up tasks.
- **QA / UAT:** Use user stories and business rules tables as a checklist.
- **Operations:** Use NFR and deployment/backup/restore items.
- **Keeping it current:** Re-scan after major features or doc changes and update this file (and “Last scanned” date).
