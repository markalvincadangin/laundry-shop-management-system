# Copilot Instructions — Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop (Ilaya, Tabuc Suba Jaro, Iloilo City)  
> **Team:** HIMÓTECH  
> **Purpose:** Replace paper-based tracking with a centralized laundry management system  
> **Status:** MVP Complete — Testing, Fixing & Polishing Phase  
> **Last Updated:** 2026-05-05

**Full AI context:** See `CLAUDE.md` at project root for comprehensive system context.

---

## Primary Source of Truth (Must Follow)

| Category | Document | Purpose |
|----------|----------|---------|
| **Business Rules** | `docs/02-requirements/business-rules.md` | Enforceable rules (BR-PR-*, BR-OL-*, BR-PAY-*) |
| **Data Schema** | `docs/04-data-design/erd.dbml` | Authoritative database schema |
| **API Contract** | `docs/05-tech-design/openapi.yaml` | All endpoints, request/response schemas |
| **User Stories** | `docs/02-requirements/user-stories.md` | Functional requirements (US-01 to US-11) |
| **Gap Analysis** | `docs/06-implementation/implementation-status.md` | What is implemented vs. required |
| **Work Plan** | `docs/06-implementation/testing-polishing-plan.md` | Active polish checklist and branches |
| **Dev Setup** | `docs/GETTING_STARTED.md` | Full onboarding guide |
| **Credentials** | `docs/development-credentials.md` | Dev seed account configuration |
| **Academic Reqs** | `academic-docs-deliverables/10-functional-requirements-matrix.md` | FR-1 to FR-10 |

**Conflict Resolution:** If any suggestion conflicts with these documents:
1. Explicitly cite the conflict (file + rule ID)
2. Propose the smallest possible fix
3. Do NOT invent new behavior not in scope

---

## Tech Stack (Must Follow Exactly)

### Backend
- **Java 21** — Language (LTS)
- **Spring Boot 3.5.10** — Framework (NOT 3.3)
- **Maven** — Build tool (NO Gradle)
- **PostgreSQL 16** — Database
- **Flyway** — Migrations (never edit after merge)
- **MapStruct 1.5.5** — DTO mapping (`disableBuilder = true` on `OrderMapper` — see Critical Decisions)
- **Lombok** — Code generation
- **JJWT 0.12.6** — JWT (HTTP-only cookie auth)
- **JUnit 5 + Mockito + Testcontainers** — Testing
- **spring-dotenv + dotenv-java** — `.env` file loading

### Frontend
- **Next.js 15.5.15** — Framework (App Router, NOT Pages Router, NOT Next.js 14)
- **React 19** — UI library
- **TypeScript 5** — Language (strict mode)
- **Tailwind CSS 3** — Styling
- **TanStack Query v5** — Server state management
- **React Hook Form + Zod** — Forms and validation
- **Recharts 3** — Charts
- **Framer Motion 12** — Animations
- **Sonner** — Toast notifications
- **Vitest + Testing Library** — Testing

**Do NOT suggest:** Gradle, older Spring Boot versions, Pages Router, Redux, class-based React components, or any library not in `package.json`.

---

## Non-Hallucination Rules

**Strict Constraints — Do NOT invent:**
- Endpoints not in `openapi.yaml`
- Database fields not in `erd.dbml`
- Order statuses beyond: `RECEIVED, WASHING, DRYING, FOLDING, READY_FOR_PICKUP, RELEASED, CANCELLED`
- User roles beyond: `ADMIN, STAFF` (NOT `OWNER` — role was renamed to `ADMIN`)
- Payment methods beyond: `CASH, GCASH, BANK_TRANSFER`
- Payment statuses beyond: `UNPAID, PAID, VOIDED` (NOT `PARTIAL` — post-MVP)

**If unsure:** Ask for clarification or cite the document. Reference specific rule IDs (e.g., "per BR-PR-01...").

---

## Domain Rules (Quick Reference)

### Pricing (BR-PR-01 to BR-PR-04)
- 1 load = **₱140** (NOT ₱120) for up to **8 kg**
- `total_loads = ceil(weight_kg / kg_limit_per_load)`
- Extra minutes: `extra_minutes × price_per_extra_minute (₱1/min)`
- Add-ons: flexible line items stored in `order_add_ons`
- `grand_total = base_amount + extra_minutes_amount + addons_total_amount`
- Pricing is **snapshotted** at order creation. Editing service rates does not affect existing orders.
- Only **ADMIN** can update service rates (BR-PR-05)

### Order Lifecycle (BR-OL-*)
- New orders: `current_status = RECEIVED`, `payment_status = UNPAID`
- Reference number format: `LDR-YYYYMMDD-XXXX` (unique, DB-enforced)
- Status flow: `RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED`
- Can cancel from any non-terminal status (BR-OL-04)
- Release requires `READY_FOR_PICKUP` **AND** `PAID` (BR-OL-05)
- Edit (extra minutes/add-ons) only allowed when `UNPAID` and not `RELEASED` (BR-OL-06)

### Payments (BR-PAY-*)
- One payment per order (BR-PAY-02); enforced by unique FK constraint
- Amount must **exactly match** `order.grand_total` (BR-PAY-03)
- Methods: `CASH`, `GCASH`, `BANK_TRANSFER`
- Cancelling a paid order auto-voids payment (BR-PAY-07)

---

## Critical Implementation Decisions (Do NOT Reverse)

1. **`@Mapper(builder = @org.mapstruct.Builder(disableBuilder = true))`** on `OrderMapper.java`  
   → MapStruct's builder inference conflicts with Lombok's `addOns` field naming. This is permanent.

2. **Null-safe `SecurityContextHolder.getContext().getAuthentication()` check in `OrderService`**  
   → Authentication can be null in unit test/scheduled task contexts. The null guard is mandatory.

3. **`COALESCE(SUM(p.amountPaid), 0)` in `PaymentRepository`**  
   → Must return `0` (not `null`) for periods with no sales. Do not remove the COALESCE.

4. **`serviceType = null` in `TestDataBuilders`**  
   → Ensures test commands route to `getActiveRate()` (the mock), not `getByName()` (unmocked).

5. **`"use client"` on all files using React hooks or DOM APIs**  
   → Next.js 15 App Router requires explicit directives. Always add when using `useState`, `useEffect`, `createPortal`, `useRef`, etc.

6. **All UI display strings live in `src/constants/ui/`**  
   → Never hardcode text in components. Always reference `UI_LABELS.*`. Adding new text = add constant first.

7. **TypeScript types are auto-generated from OpenAPI**  
   → Run `npm run generate:types` after changing `openapi.yaml`. Never manually edit `src/types/api.generated.ts`.

8. **Enums are stored as `varchar` in PostgreSQL (not native PG enums)**  
   → The ERD documents this explicitly. JPA maps to `@Enumerated(EnumType.STRING)`.

---

## Git Workflow

**Active Branches:**
```
develop (stable baseline)
├── polish/orders-module      ← Track A, Step 1 (ACTIVE)
├── polish/payments-module    ← Track A, Step 2
├── polish/reports-module     ← Track B (simultaneous)
├── polish/customers-module   ← Track B (simultaneous)
└── polish/admin-settings     ← Track B (simultaneous)
```

**Commit Convention:** `type(scope): message`  
Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

**PR Rules:** All PRs target `develop`. Use `.github/pull_request_template.md`.

**Before pushing — run locally:**
```bash
# Backend
cd backend && mvn -B -ntp verify

# Frontend  
cd frontend && npm run lint && npm run typecheck && npm run build
```

---

## Architecture Summary

### Backend
```
Controller (HTTP only, thin — delegates to service)
    ↓
Service (ALL business rules, @Transactional)
    ↓
Repository (JPA/persistence only, no logic)
```

**Package root:** `com.himotech.laundryms`  
**Key packages:** `api/`, `orders/`, `payments/`, `rates/`, `reports/`, `auth/`, `users/`, `customers/`, `auditlog/`, `clientalert/`

### Frontend
```
app/(dashboard)/   ← Auth-required staff/admin pages
app/(auth)/        ← Login
app/(public)/      ← Public tracking page (/track)
```

**Key patterns:**
- Data fetching via TanStack Query hooks in `src/hooks/`
- API calls in `src/services/`
- All UI text in `src/constants/ui/`
- Shared components in `src/components/ui/`
- Feature components in `src/components/features/<module>/`

---

## Access Control

| Role | Permissions |
|------|------------|
| **ADMIN** | All operations + reports + service rates + user management + audit logs |
| **STAFF** | Orders, status updates, payments, customers |
| **Public** | Order tracking by reference number (limited data only) |

**Auth:** JWT stored in HTTP-only cookie (`access_token`). Spring Security on backend, `AuthContext` on frontend.
