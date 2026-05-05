# CLAUDE.md — Faith Laundry Shop Management System
> **Team / Client:** HIMÓTECH × Faith Laundry Shop  
> **Last Updated:** 2026-05-05  
> **Current Active Branch:** `polish/orders-module`  
> **Baseline Branch:** `develop`

This file is the authoritative AI context guide for the **Faith Laundry Shop Management System**. Read this before making any code changes.

---

## 1. Project Overview

A full-stack web application designed to digitize and streamline the operations of a laundry shop. It replaces manual, paper-based workflows with automated pricing, order tracking, payment recording, and sales reporting.

- **Client:** Faith Laundry Shop
- **Team:** HIMÓTECH
- **Academic Context:** Capstone project. All work must remain aligned with deliverables in `academic-docs-deliverables/`.
- **Status:** MVP fully implemented. Currently in **Testing, Fixing & Polishing** phase.

---

## 2. Technology Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.5.14 (**EOL: June 30, 2026** — plan Spring Boot 4.0 migration post-MVP) |
| ORM | Spring Data JPA + Hibernate |
| DB Migrations | Flyway |
| Database | PostgreSQL 16 |
| Security | Spring Security + JWT (JJWT 0.12.6, HTTP-only cookie) |
| DTO Mapping | MapStruct 1.6.3 (with `disableBuilder = true` on OrderMapper — do NOT remove) |
| Code Gen | Lombok |
| Validation | Jakarta Validation (Bean Validation) |
| Testing | JUnit 5, Mockito, Testcontainers (PostgreSQL), AssertJ |
| Build | Maven (`mvn -B -ntp verify`) |
| Code Quality | Checkstyle |
| Observability | Spring Boot Actuator |
| Config | spring-dotenv + dotenv-java (`.env` files per component) |

### Frontend
| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5 |
| Framework | Next.js 15.5.15 (App Router, Server Actions enabled) |
| UI Library | React 19 |
| Styling | Tailwind CSS 3 + custom `globals.css` design tokens |
| State/Data | TanStack Query (React Query v5) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts 3 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Toasts | Sonner |
| Print/PDF | html-to-image + html2canvas |
| Barcodes | react-barcode |
| Testing | Vitest + Testing Library + happy-dom |
| Type Generation | `openapi-typescript` (from `docs/05-tech-design/openapi.yaml`) |
| Build/Lint | ESLint 9 + `tsc --noEmit` |

### Infrastructure
| Layer | Technology |
|-------|-----------|
| Containerization | Docker Compose (dev: `docker-compose.yml`, prod: `docker-compose.prod.yml`) |
| Reverse Proxy | Nginx (production only) |
| Tunneling (dev) | ngrok (`ngrok.yml`) |
| DB Backups | Shell + PowerShell scripts in `scripts/` |
| CI/CD | GitHub Actions (`.github/workflows/`) |

---

## 3. Repository Structure

```
laundry-shop-management-system/
├── backend/                          # Spring Boot application
│   └── src/
│       ├── main/java/com/himotech/laundryms/
│       │   ├── api/                  # Shared DTOs, mappers (OrderMapper)
│       │   ├── auditlog/             # AuditLog AOP + entity
│       │   ├── auth/                 # JWT auth + AuthController
│       │   ├── clientalert/          # Client notification logs
│       │   ├── common/               # Shared: exceptions, pagination
│       │   ├── config/               # SecurityConfig, WebConfig, JacksonConfig
│       │   ├── customers/            # Customer entity + service + controller
│       │   ├── health/               # /api/v1/health endpoint
│       │   ├── orders/               # Core domain (entity, service, controller, specs)
│       │   ├── payments/             # Payment entity + service + controller
│       │   ├── rates/                # ServiceRate entity + service + controller
│       │   ├── reports/              # Revenue aggregation + ReportsController
│       │   ├── security/             # JwtFilter, UserDetailsService
│       │   └── users/                # User management
│       └── resources/
│           └── db/migration/         # V1__init.sql, V2__seed_users.sql
├── frontend/                         # Next.js application
│   └── src/
│       ├── app/
│       │   ├── (auth)/               # /login
│       │   ├── (dashboard)/          # All admin/staff pages (orders, payments, reports, etc.)
│       │   └── (public)/             # /track — public order tracking
│       ├── components/
│       │   ├── features/             # Module-specific components
│       │   │   ├── orders/           # IntakeWizard, OrderIntakeForm, ClaimStub, LiveTicket
│       │   │   ├── dashboard/        # OrderPipeline, OrderCard, ProcessStepper
│       │   │   ├── payments/         # Checkout components
│       │   │   ├── reports/          # RevenueChart
│       │   │   └── client-alerts/    # ClientAlertPopover
│       │   ├── layout/               # Topbar, MobileNav, Sidebar
│       │   └── ui/                   # Shared atoms: Modal, Input, KPICard, StatusBadge
│       ├── constants/ui/             # ALL UI strings — modules/, shared, forms, etc.
│       ├── hooks/                    # useOrders, usePayments, usePriceCalculation, etc.
│       ├── services/                 # API service layer (axios-based)
│       ├── types/                    # api.generated.ts (auto-gen from OpenAPI), components.ts
│       └── tests/                    # Vitest test files mirroring app/ structure
├── docs/                             # Full technical documentation
│   ├── 02-requirements/              # User stories, business rules
│   ├── 04-data-design/erd.dbml       # Authoritative database schema
│   ├── 05-tech-design/openapi.yaml   # Authoritative API contract
│   └── 06-implementation/            # Status, polishing plan, user manual, handover
├── academic-docs-deliverables/       # Academic submission documents (FRM, FRC, WBS, etc.)
├── .github/workflows/                # backend-ci.yml, frontend-ci.yml
└── CLAUDE.md                         # This file
```

---

## 4. Database Schema Summary

**9 tables** in PostgreSQL:

| Table | Purpose |
|-------|---------|
| `users` | System users. `role`: `ADMIN` or `STAFF`. UUID PK. |
| `customers` | Customer registry. `bigserial` PK. Unique on (last_name, first_name, contact_number). |
| `service_rates` | Pricing config. Snapshot copied to orders at creation. |
| `orders` | Core entity. Contains pricing snapshot, status, payment_status. |
| `order_add_ons` | Line items (e.g., Fabric Conditioner) linked to an order. |
| `payments` | One-to-one with orders. Records amount, method, receiver. |
| `notifications` | In-app notification queue. Triggered on `READY_FOR_PICKUP`. |
| `activity_logs` | Forensic audit trail. Populated by DB-level triggers. |

**Key Enums (stored as `varchar`):**
- `order_status`: `RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED` (also `CANCELLED`)
- `payment_status`: `UNPAID`, `PAID`, `VOIDED`
- `payment_method`: `CASH`, `GCASH`, `BANK_TRANSFER`
- `user_role`: `ADMIN`, `STAFF`

---

## 5. Core Business Rules (Quick Reference)

| Rule ID | Summary |
|---------|---------|
| BR-PR-01 | 1 load = ₱140 for up to 8 kg |
| BR-PR-02 | `total_loads = ceil(weight_kg / 8)` |
| BR-PR-03 | Extra minutes charged at ₱1/min |
| BR-PR-04 | Add-ons (e.g., Fabric Conditioner) add to grand total |
| BR-PR-05 | Only Admin can update service rates |
| BR-OL-01 | Every order has a unique reference: `LDR-YYYYMMDD-XXXX` |
| BR-OL-02 | New orders always start as `RECEIVED` |
| BR-OL-04 | Status transitions are strictly ordered (no skipping) |
| BR-OL-05 | Release requires `READY_FOR_PICKUP` + `PAID` |
| BR-OL-06 | Edit (extra minutes/add-ons) only when `UNPAID` and not `RELEASED` |
| BR-PAY-02 | One payment per order |
| BR-PAY-03 | Payment amount must exactly match grand total |
| BR-PAY-07 | Cancelling a paid order auto-voids the payment |

Full catalog: `docs/02-requirements/business-rules.md`

---

## 6. API Endpoints Summary

Base URL: `http://localhost:8080/api/v1`  
Auth: JWT in HTTP-only cookie (`access_token`)

| Module | Endpoints |
|--------|----------|
| System | `GET /health` |
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Customers | `GET/POST /customers`, `GET /customers/{id}` |
| Service Rates | `GET /service-rates`, `GET /service-rates/active`, `PATCH /service-rates/{id}` (Admin) |
| Orders | `POST /orders`, `POST /orders/preview`, `GET /orders`, `GET /orders/stats`, `GET /orders/{id}`, `GET /orders/reference/{ref}`, `PATCH /orders/{id}`, `PATCH /orders/{id}/status`, `DELETE /orders/{id}` |
| Payments | `POST /payments`, `GET /payments`, `GET /payments/{id}` |
| Notifications | `GET /notifications` |
| Reports | `GET /reports/sales/daily`, `/monthly`, `/yearly` |
| Audit Log | `GET /audit-logs` (Admin) |
| Users | `GET/POST /users`, `PATCH /users/{id}` (Admin) |

Full spec: `docs/05-tech-design/openapi.yaml`

---

## 7. Frontend Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/login` | Login page | Public |
| `/track` | Public order tracking by reference | Public |
| `/overview` | Dashboard overview / KPIs | Staff/Admin |
| `/orders` | Order queue + pipeline | Staff/Admin |
| `/orders/new` | New order intake wizard | Staff/Admin |
| `/orders/[id]` | Order detail + status actions | Staff/Admin |
| `/orders/[id]/pay` | Payment checkout | Staff/Admin |
| `/customers` | Customer directory | Staff/Admin |
| `/customers/[id]` | Customer detail | Staff/Admin |
| `/payments` | Payment history | Admin |
| `/reports` | Sales reports (daily/monthly/yearly) | Admin |
| `/rates` | Service rate management | Admin |
| `/client-alerts` | SMS/Notification log | Admin |
| `/users` | User management | Admin |
| `/audit-logs` | Forensic activity log | Admin |

---

## 8. Critical Implementation Decisions (Do NOT Reverse)

1. **`@Mapper(builder = @org.mapstruct.Builder(disableBuilder = true))`** on `OrderMapper.java`  
   → MapStruct builder causes naming collision with Lombok's `addOns` builder methods. This is intentional.

2. **Null-safe auth check in `OrderService.java`**  
   → `SecurityContextHolder.getContext().getAuthentication()` can return null in unit test contexts. The null check is mandatory.

3. **`COALESCE(SUM(p.amountPaid), 0)` in `PaymentRepository`**  
   → Must return `0` (not `null`) for periods with no sales. Critical for reports.

4. **`serviceType = null` in `TestDataBuilders`**  
   → Ensures test commands use `getActiveRate()` (the mock) instead of `getByName()` (unmocked).

5. **`"use client"` on all components using hooks or DOM APIs**  
   → Next.js 15 App Router requires explicit `"use client"` directives. Always add when using `useState`, `useEffect`, `createPortal`, etc.

6. **All UI strings live in `src/constants/ui/`**  
   → Never hardcode display text in components. Always reference `UI_LABELS.*`.

7. **Types are auto-generated from OpenAPI**  
   → Run `npm run generate:types` after changing `openapi.yaml`. Do NOT manually edit `api.generated.ts`.

---

## 9. Development Setup

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 20, npm
- Docker Desktop (for PostgreSQL via Testcontainers or docker-compose)
- PostgreSQL 16 (local or via docker-compose)

### Quick Start
```bash
# 1. Start the database
docker-compose up -d db

# 2. Start the backend
cd backend
cp .env.example .env  # Fill in your values
./mvnw spring-boot:run

# 3. Start the frontend
cd ../frontend
npm install
npm run dev
```

### Environment Variables (Backend `backend/.env`)
```
SPRING_PROFILES_ACTIVE=dev
DATABASE_URL=jdbc:postgresql://localhost:5432/laundry_db
DATABASE_USERNAME=laundry_user
DATABASE_PASSWORD=your_password
JWT_SECRET=your_64char_secret
SEED_ADMIN_USERNAME=Admin
SEED_ADMIN_PASSWORD_HASH=<bcrypt_hash>
SEED_STAFF_USERNAME=staff
SEED_STAFF_PASSWORD_HASH=<bcrypt_hash>
```

### Frontend Environment (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 10. CI/CD Pipelines

Both pipelines trigger on PRs and pushes to `develop` and `main`.

### Backend CI (`.github/workflows/backend-ci.yml`)
```bash
# What it runs:
chmod +x ./mvnw
./mvnw -B -ntp verify
# Includes: Checkstyle → Compile → Unit Tests → Integration Tests (Testcontainers) → JaCoCo Coverage Check → Package
```

### Frontend CI (`.github/workflows/frontend-ci.yml`)
```bash
# What it runs:
npm ci
npm run lint       # ESLint
npm run test       # Vitest
npm run typecheck  # tsc --noEmit
npm run build      # next build
```

**Run locally before pushing:**
```bash
# Backend
cd backend && mvn -B -ntp verify

# Frontend
cd frontend && npm run lint && npm run typecheck && npm run build
```

---

## 11. Git Branching Strategy

```
main          ← Production-ready releases only (tagged)
  └── develop ← Stable integration baseline (all PRs target here)
        ├── polish/orders-module     ← Track A, Step 1 (ACTIVE)
        ├── polish/payments-module   ← Track A, Step 2
        ├── polish/reports-module    ← Track B (simultaneous)
        ├── polish/customers-module  ← Track B (simultaneous)
        └── polish/admin-settings    ← Track B (simultaneous)
```

**Commit convention:** `type(scope): message`  
Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

**Full polishing plan:** `docs/06-implementation/testing-polishing-plan.md`

---

## 12. Key Documentation Files

| File | Purpose |
|------|---------|
| `docs/GETTING_STARTED.md` | Full developer onboarding guide |
| `docs/development-credentials.md` | How to configure seed accounts |
| `docs/02-requirements/business-rules.md` | All BR-* rules |
| `docs/04-data-design/erd.dbml` | Authoritative database schema |
| `docs/05-tech-design/openapi.yaml` | Authoritative API contract |
| `docs/06-implementation/implementation-status.md` | MVP gap analysis |
| `docs/06-implementation/testing-polishing-plan.md` | Active work plan + checklists |
| `docs/06-implementation/user-manual.md` | End-user documentation |
| `academic-docs-deliverables/10-functional-requirements-matrix.md` | Academic FRM (FR-1 to FR-10) |
