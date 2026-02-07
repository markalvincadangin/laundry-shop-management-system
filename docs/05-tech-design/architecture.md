# System Architecture Overview
## Faith Laundry Shop Management System

> **Purpose:** Provide a clear, implementation-ready architecture for a fast and maintainable build.  
> **Status:** Baseline (MVP)

---

## 1. Goals
- Replace paper-based tracking (tags/logbooks) with a centralized system
- Enable order tracking via unique reference number
- Automate pricing computation and store transaction history
- Provide income reports (daily/monthly/yearly) based on recorded payments
- Support customer communication via notifications (MVP optional)

---

## 2. Scope (MVP)
### In Scope
- Staff/Owner authentication (simple username/password)
- Customer management (create/search basic info)
- Order intake: record weight, compute loads and totals, generate reference number
- Order status updates + audit trail (status logs)
- Payment recording (one payment per order)
- Sales reporting (daily/monthly/yearly)
- Order tracking endpoint by reference number

### Out of Scope (MVP+)
- Full inventory/item-level tracking of clothing pieces
- Machine maintenance monitoring
- Online booking / scheduling
- Advanced analytics dashboards
- Multi-branch support

---

## 3. High-Level Architecture (C4-lite)

### 3.1 System Context
**Actors**
- **Owner**: views reports, manages rates, oversees operations
- **Staff**: encodes orders, updates status, records payments
- **Customer**: tracks order status via reference number

**External Services (optional)**
- SMS provider (for ready-for-pickup notifications)

---

### 3.2 Containers
1. **Web App (Frontend)**
    - Tech: **Next.js**
    - Responsibilities:
        - UI for order intake, status updates, payment recording
        - Reports dashboard for owner
        - Public tracking page (reference number lookup)

2. **API Server (Backend)**
    - Tech: **Java Spring Boot**
    - Responsibilities:
        - Business rules enforcement (pricing, status transitions, validation)
        - Order reference generation + uniqueness
        - Auth + role-based access control (OWNER vs STAFF)
        - Reporting queries (based on payments)
        - Notification triggers (MVP optional)

3. **Database**
    - Tech: **PostgreSQL**
    - Responsibilities:
        - Persistent storage of customers, orders, payments, status logs, rates
        - Enforce core constraints (uniques, FKs)

4. **Notification Service (Optional / MVP+)**
    - Tech: internal module or external provider API
    - Responsibilities:
        - Queue/send SMS
        - Track sent/failed status

---

## 4. Backend Modules (Spring Boot)
Recommended package/module boundaries:

- `auth`
    - login, JWT/session, role guards

- `users`
    - user management (owner/staff), seeded admin

- `customers`
    - CRUD, search

- `rates`
    - service_rates management (active rate retrieval)

- `orders`
    - order creation, pricing computation, reference generation

- `orderstatus`
    - status updates, transition validation, status logs

- `payments`
    - create payment (1:1), update order payment status

- `reports`
    - daily/monthly/yearly sales queries from payments

- `notifications` (optional)
    - record + send notifications on READY_FOR_PICKUP

---

## 5. Core Data Flow (MVP)

### 5.1 Order Intake
1. Staff selects/creates customer
2. Staff inputs weight + optional extra minutes + add-ons
3. Backend loads active service rate
4. Backend computes:
    - `total_loads = ceil(weight_kg / kg_limit)`
    - `base_amount = total_loads * base_price_per_load`
    - `extra_minutes_amount = extra_minutes * price_per_extra_minute`
    - `addons_total_amount = sum(add-ons)`
    - `grand_total = base + extra + addons`
5. Backend generates unique `reference_number`
6. Backend stores order with `current_status = RECEIVED`, `payment_status = UNPAID`

### 5.2 Status Updates + Audit Trail
1. Staff updates order status
2. Backend validates status is allowed (and transition rules if enforced)
3. Backend inserts `order_status_logs` record
4. Backend updates `orders.current_status`

### 5.3 Payment Recording
1. Staff records payment upon pickup
2. Backend validates:
    - payment does not already exist for order (1:1)
    - amount matches `orders.grand_total` (or owner override later)
3. Backend inserts payment and updates `orders.payment_status = PAID`

### 5.4 Reporting
1. Owner requests daily/monthly/yearly report
2. Backend aggregates totals from payments within date range

### 5.5 Customer Tracking (Public)
1. Customer enters `reference_number`
2. Backend returns status and basic order summary

---

## 6. Security (MVP)
- Role-based access:
    - **Owner:** reports, rates management
    - **Staff:** orders, status updates, payments, customers
- Public tracking endpoint should return limited data:
    - status, created date, reference number
    - do NOT expose internal IDs or staff info

---

## 7. Observability (Minimal but Useful)
- Structured logs for:
    - order creation
    - status changes
    - payment creation
- Basic error model (consistent API error response)

---

## 8. Deployment (Dev)
- Local dev:
    - Frontend: `localhost:3000`
    - Backend: `localhost:8080`
    - PostgreSQL via Docker or local install
- Environment variables:
    - DB connection
    - JWT secret (if used)
    - SMS provider keys (optional)

---

## 9. Architecture Decisions (ADR-lite)
- **Markdown-first documentation** stored under `/docs`
- **OpenAPI contract** as the API source-of-truth
- **DBML ERD** as the data design source-of-truth
- Store computed totals in `orders` to preserve historical accuracy even if rates change
