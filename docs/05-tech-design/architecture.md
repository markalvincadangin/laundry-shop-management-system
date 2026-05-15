# System Architecture Overview
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** ARCH-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Define implementation-ready architecture aligned to scope and requirements  
> **Status:** Baseline (MVP)

---

## Document Control
- **Document Type:** Technical Design — Architecture
- **Related Documents:** [Project Scope](../01-scope/project-scope.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Non-Functional Requirements](../02-requirements/non-functional-requirements.md), [To-Be Process Flow](../03-process/to-be-flow.md), [ERD](../04-data-design/erd.dbml), [Data Design Notes](../04-data-design/data-notes.md), [OpenAPI Spec](openapi.yaml), [Deployment Guide](../06-implementation/deployment-guide.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Goals

- Replace paper-based tracking (tags, logbooks) with a centralized system
- Enable order tracking via unique reference number
- Automate pricing computation (load-based, extra minutes, add-ons) and store transaction history
- Provide income reports (daily, monthly, yearly) from recorded payments
- Support customer notifications when an order is ready for pickup (MVP optional)

---

## 2. Scope (MVP)

### 2.1 In Scope

- Admin and Staff authentication (username/password)
- Customer management (create, search by name/contact)
- Order intake: record weight (kg), compute loads (8 kg per load) and totals, generate a unique reference number
- Order status updates with audit trail (order_status_logs)
- Payment recording (one payment per order; amount must equal order grand total)
- Sales reporting (daily, monthly, yearly) from payments
- Public order tracking by reference number

### 2.2 Out of Scope (MVP+)

- Inventory or item-level tracking
- Machine maintenance monitoring
- Online booking or scheduling
- Advanced analytics dashboards
- Multi-branch support

---

## 3. Technology Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Backend    | Java 21, Spring Boot 3.5+, Maven      |
| Frontend   | Next.js 15+, TypeScript, Tailwind CSS |
| Database   | PostgreSQL 16                         |
| Migrations | Flyway                                |
| Local Dev  | Docker Compose                        |
| Testing    | Testcontainers                        |
| Config     | `.env` (local only; never committed)  |

---

## 4. High-Level Architecture (C4-lite)

### 4.1 System Context

**Actors**
- **Admin:** Views reports, manages rates, oversees operations
- **Staff:** Encodes orders, updates status, records payments
- **Customer:** Tracks order status via reference number (public endpoint)

**External Services (Optional)**
- SMS provider for ready-for-pickup notifications (post-MVP)

### 4.2 Containers

1. **Web App (Frontend)** — Next.js 14+, TypeScript, Tailwind
   - Order intake, status updates, payment recording
   - Reports dashboard (Admin only)
   - Public tracking page (reference number lookup)

2. **API Server (Backend)** — Java Spring Boot 3.5+
   - Business rules enforcement (Service layer only)
   - Reference number generation and uniqueness
   - Auth and role-based access (ADMIN vs STAFF)
   - Reporting queries from payments
   - Notification triggers (MVP optional)

3. **Database** — PostgreSQL 16
   - Persistent storage per [ERD](../04-data-design/erd.dbml)
   - Enforces unique constraints, foreign keys

4. **Notification Service** — Optional / post-MVP
   - Queue or send SMS
   - Track sent/failed status

---

## 5. Layering and Responsibility

All business rules are enforced in the **Service layer only**. Controllers and repositories do not contain business logic.

| Layer          | Responsibility                                                           |
|----------------|--------------------------------------------------------------------------|
| **Controller** | HTTP handling, request/response mapping, validation annotations          |
| **Service**    | Business rules (BR-PR-*, BR-OL-*, BR-PAY-*), computations, orchestration |
| **Repository** | Data access, persistence                                                 |
| **Database**   | Storage, constraints (uniques, FKs)                                      |

---

## 6. Backend Modules (Spring Boot)

- **auth** — Login, JWT/session, role guards
- **users** — User management (Admin/Staff), seeded admin
- **customers** — CRUD, search (US-01)
- **rates** — Service rates management, active rate retrieval
- **orders** — Order creation, pricing computation, reference generation (US-01, US-02)
- **activity** — Read-only access to `activity_logs`; surfaces forensic audit trail to the dashboard (US-03, US-05)
- **payments** — Create payment (1:1), validate amount equals grand total, update payment status (US-06)
- **reports** — Daily, monthly, yearly sales from payments (US-08, US-09)
- **notifications** (optional) — Record and send on READY_FOR_PICKUP (US-10)

---

## 7. Core Data Flows (MVP)

### 7.1 Order Intake

1. Staff selects or creates a customer
2. Staff inputs weight (kg), optional extra minutes, optional add-ons
3. Backend loads active service rate and snapshots pricing
4. Backend computes: `total_loads = ceil(weight_kg / kg_limit)`, `base_amount`, `extra_minutes_amount`, `addons_total_amount`, `grand_total`
5. Backend generates unique `reference_number`
6. Backend stores order with `current_status = RECEIVED`, `payment_status = UNPAID`

### 7.2 Status Updates and Audit Trail

1. Staff requests a status update via the API
2. Backend validates the allowed status and transition (BR-OL-03, BR-OL-04, BR-OL-05)
3. Backend updates `orders.current_status`
4. **Hybrid Auditing Synergy**:
   - **Database Layer**: The `trg_audit_orders` trigger fires automatically, invoking `fn_audit_activity()`, which writes a full JSONB snapshot (old and new row) to `activity_logs`.
   - **Application Layer**: The `@Auditable` aspect intercepts the call and publishes an asynchronous `AuditEvent` to capture high-level intent, outcome (SUCCESS/FAILURE), and forensic context (IP Address, User Agent).
5. Both layers write to the same `activity_logs` table, providing a complete forensic record.

### 7.3 Payment Recording

1. Staff records payment upon pickup (payment method: Cash, GCash, or Bank Transfer — BR-PAY-05)
2. Backend validates: no existing payment for order (BR-PAY-02), amount equals `orders.grand_total` (BR-PAY-03)
3. Backend inserts payment (including payment_method) and sets `orders.payment_status = PAID` (BR-PAY-04)
4. MVP: Partial payments are not supported; PARTIAL is reserved for post-MVP

### 7.4 Reporting

1. Admin requests report (daily, monthly, yearly)
2. Backend aggregates totals from payments within the date range

### 7.5 Customer Tracking (Public)

1. Customer enters `reference_number`
2. Backend returns a limited subset: status, created date, reference number, basic summary (no internal IDs, staff info)

---

## 8. Environment and Deployment

### 8.1 Local Development

- **Frontend:** `localhost:3001`
- **Backend:** `localhost:8080` (mapped to host via `BACKEND_PORT`)
- **Database:** PostgreSQL 16 via Docker Compose
- **Configuration:** Unified `.env` at project root — gitignored; use `.env.example` as template
- **Secrets:** Never committed; JWT secret, DB credentials in root `.env`
- **Orchestration:** `docker compose up -d`

### 8.2 CI

- Testcontainers for integration tests (PostgreSQL 16)
- No secrets in the repository

---

## 9. Security (MVP)

- Role-based access: Admin (reports, rates); Staff (orders, status, payments, customers)
- Public tracking endpoint returns only: reference number, current status, created date, basic customer/payment summary — no internal IDs or staff information

---

## 10. Observability

- Structured logs for order creation, status changes, payment creation
- Consistent API error response format per [OpenAPI spec](openapi.yaml) (ErrorResponse schema)

---

## 11. Architecture Decisions (ADR-lite)

- Markdown documentation under `/docs` as a source of truth
- OpenAPI contract as an API source of truth
- DBML ERD as a data design source of truth
- Pricing snapshot stored in `orders` for historical accuracy when rates change
