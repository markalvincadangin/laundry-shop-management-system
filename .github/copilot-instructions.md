# Copilot Instructions — Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop (Ilaya, Tabuc Suba Jaro, Iloilo City)  
> **Purpose:** Replace paper-based tracking (tags/logbooks) with a centralized laundry management system  
> **Status:** MVP Development  
> **Date:** 2026-02-10

---

## Project Context

Faith Laundry Shop is a small-scale laundry service business established in 2022, operating for ~3 years with manual paper-based processes. Current problems include:
- Manual and time-consuming record keeping
- Occasional order mix-ups due to lost/damaged physical tags
- No automated pricing computation (manual calculations)
- Difficulty generating sales reports (requires manual review of notebooks)

**Solution:** Build a web-based management system to automate order tracking, pricing computation, payment recording, and reporting.

---

## Primary Source of Truth (Must Follow)

**Documentation Index (All `/docs/**` files):**

| Category | Document | Purpose |
|----------|----------|---------|
| **Context** | [docs/00-context/case-study.md](../docs/00-context/case-study.md) | Client background and problem statement |
| **Context** | [docs/00-context/client-interview.md](../docs/00-context/client-interview.md) | Interview notes and requirements discovery |
| **Scope** | [docs/01-scope/project-scope.md](../docs/01-scope/project-scope.md) | MVP boundaries and deliverables |
| **Requirements** | [docs/02-requirements/user-stories.md](../docs/02-requirements/user-stories.md) | Functional requirements (US-01 to US-11) |
| **Requirements** | [docs/02-requirements/business-rules.md](../docs/02-requirements/business-rules.md) | Enforceable business rules (BR-*) |
| **Process** | [docs/03-process/to-be-flow.md](../docs/03-process/to-be-flow.md) | To-be process flow |
| **Data Design** | [docs/04-data-design/erd.dbml](../docs/04-data-design/erd.dbml) | Database schema (source of truth) |
| **Data Design** | [docs/04-data-design/erd.svg](../docs/04-data-design/erd.svg) | Visual ERD diagram |
| **Data Design** | [docs/04-data-design/data-notes.md](../docs/04-data-design/data-notes.md) | Data design notes |
| **Tech Design** | [docs/05-tech-design/openapi.yaml](../docs/05-tech-design/openapi.yaml) | API contract definitions |
| **Tech Design** | [docs/05-tech-design/architecture.md](../docs/05-tech-design/architecture.md) | System architecture and data flows |
| **Implementation** | [docs/06-implementation/implementation-plan.md](../docs/06-implementation/implementation-plan.md) | Phase-by-phase development roadmap |
| **Setup** | [docs/development-credentials.md](../docs/development-credentials.md) | Development credentials (local only) |
| **Setup** | [docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md) | Getting started guide |
| **Setup** | [docs/README.md](../docs/README.md) | Documentation overview |
| **Standards** | [docs/STYLE_GUIDE.md](../docs/STYLE_GUIDE.md) | Code style and conventions |
| **Standards** | [docs/STAGE1_INVENTORY_AND_TERMINOLOGY.md](../docs/STAGE1_INVENTORY_AND_TERMINOLOGY.md) | Inventory and terminology reference |

**Documentation Hierarchy (Primary References):**
1. [docs/00-context/case-study.md](../docs/00-context/case-study.md) - Client background and problem statement
2. [docs/02-requirements/user-stories.md](../docs/02-requirements/user-stories.md) - Functional requirements (US-01 to US-11)
3. [docs/02-requirements/business-rules.md](../docs/02-requirements/business-rules.md) - Enforceable business rules (BR-*)
4. [docs/04-data-design/erd.dbml](../docs/04-data-design/erd.dbml) - Database schema and relationships
5. [docs/05-tech-design/openapi.yaml](../docs/05-tech-design/openapi.yaml) - API contract definitions
6. [docs/05-tech-design/architecture.md](../docs/05-tech-design/architecture.md) - System architecture and data flows
7. [docs/06-implementation/implementation-plan.md](../docs/06-implementation/implementation-plan.md) - Phase-by-phase development roadmap

**Conflict Resolution:**
If any suggestion conflicts with these documents:
1. Explicitly point out the conflict (file + section)
2. Propose the smallest possible fix
3. Do NOT invent new behavior
4. Cite the relevant document reference (US-xx, BR-xx, etc.)

---

## Tech Stack (Must Follow Exactly)

### Backend
- **Java 21 (LTS)** - Language version
- **Spring Boot 3.3+** - Framework
- **Maven** - Build tool (NO Gradle)
- **PostgreSQL 16** - Database (requires `pgcrypto` extension for UUIDs)
- **Flyway** - Database migrations
- **JUnit 5 + Testcontainers** - Testing

### Frontend
- **Next.js 14+** - Framework (App Router)
- **React** - UI library
- **TypeScript** - Language
- **Tailwind CSS** - Styling

### Infrastructure
- **Docker & Docker Compose** - Local development and database
- PostgreSQL container on port 5433 → 5432

**Do NOT suggest:**
- Gradle, older Spring Boot patterns, different databases, alternative migration tools, class-based React components

---

## Non-Hallucination Rules

**Strict Constraints:**
- Do NOT invent endpoints, database fields, enums, statuses, pricing rules, or roles
- Do NOT assume features marked as MVP+ unless explicitly enabled
- Do NOT add fields to DTOs/entities that don't exist in ERD or OpenAPI
- Do NOT create new order statuses beyond: RECEIVED, WASHING, DRYING, FOLDING, READY_FOR_PICKUP, RELEASED, CANCELLED
- Do NOT create new user roles beyond: OWNER, STAFF
- Do NOT create new payment methods beyond: CASH, GCASH, BANK_TRANSFER

**If Unsure:**
- Ask for clarification OR cite the document used
- Prefer minimal, incremental changes
- Reference specific business rules (e.g., "per BR-PR-01...")

---

## Domain Rules (MVP Scope)

### Pricing Rules (BR-PR-01 to BR-PR-04)

**Base Pricing (BR-PR-01):**
- One (1) load = **₱120.00**
- One load covers up to **8 kg**
- Reject order if weight is missing/invalid

**Load Calculation (BR-PR-02):**
- `total_loads = ceil(weight_kg / 8)`
- Examples:
  - 8.0 kg = 1 load
  - 8.1 kg = 2 loads
  - 16.0 kg = 2 loads
  - 16.1 kg = 3 loads

**Extra Washing Time (BR-PR-03):**
- First **45 minutes per load** included in base price
- Extra minutes = any washing time beyond 45 min/load
- Extra charge = **₱1.00 per extra minute**
- Optional field (default = 0 if not provided)

**Add-ons (BR-PR-04):**
- Optional items (e.g., extra fabric conditioner)
- Store as flexible line items in `order_add_ons` table
- No fixed pricing; configured per order

**Computation Formula:**
```
base_amount = total_loads × base_price_per_load
extra_minutes_amount = extra_minutes × price_per_extra_minute
addons_total_amount = sum(order_add_ons.price × quantity)
grand_total = base_amount + extra_minutes_amount + addons_total_amount
```

**Snapshot Pricing:**
- Store pricing rates at order creation time
- Fields: `base_price_per_load`, `kg_limit_per_load`, `price_per_extra_minute`
- Ensures historical accuracy even if rates change later

### Order Lifecycle Rules (BR-OL-01 to BR-OL-05)

**Reference Number (BR-OL-01):**
- Every order must have a unique `reference_number`
- Used for customer tracking
- Enforce uniqueness via database constraint + backend validation

**Initial Status (BR-OL-02):**
- New orders start with `current_status = RECEIVED`

**Allowed Statuses (BR-OL-03):**
- RECEIVED, WASHING, DRYING, FOLDING, READY_FOR_PICKUP, RELEASED, CANCELLED

**Status Transitions (BR-OL-04 - Recommended):**
- Logical flow: RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED
- Can transition to CANCELLED from any non-terminal status before RELEASED
- Record all status changes in `order_status_logs` table with timestamp and user

**Release Preconditions (BR-OL-05):**
- Order can only be RELEASED if current status is READY_FOR_PICKUP
- Reject release action if not ready

### Payment Rules (BR-PAY-01 to BR-PAY-04)

**Payment Timing (BR-PAY-01):**
- Typically collected upon pickup (not drop-off)
- Process rule, not a strict validation

**One-to-One Relationship (BR-PAY-02):**
- Exactly one payment per order
- Enforced by unique constraint on `payments.order_id`
- Reject if payment already exists for order

**Amount Validation (BR-PAY-03):**
- Payment amount must **exactly match** `order.grand_total`
- MVP: No partial payments, overpayments, or change handling
- Owner override is post-MVP feature

**Payment Status (BR-PAY-04):**
- UNPAID (default), PAID, PARTIAL (reserved for post-MVP)
- Update `orders.payment_status = PAID` when payment recorded

### Notification Rules (BR-NOTIF-01, BR-NOTIF-02)

**Ready Notification (BR-NOTIF-01 - Optional MVP):**
- Trigger notification when status → READY_FOR_PICKUP
- Store in `notifications` table
- SMS/email adapter optional

**Tracking (BR-NOTIF-02):**
- Customers can track order by `reference_number`
- Public endpoint returns limited data only (no internal IDs, staff info)

---

## Implementation Standards

### Backend Architecture

**Layered Structure:**
```
Controller (HTTP only)
    ↓
Service (ALL business rules)
    ↓
Repository (Persistence only)
```

**Package/Module Boundaries:**
- `auth` - Login, JWT/session, role guards
- `users` - User management (owner/staff)
- `customers` - CRUD, search
- `rates` - Service rates management
- `orders` - Order creation, pricing computation, reference generation
- `orderstatus` - Status updates, transition validation, status logs
- `payments` - Payment recording (1:1), update payment status
- `reports` - Daily/monthly/yearly sales queries
- `notifications` - (Optional) Notification triggers

**Service Layer Rules:**
- Enforce ALL business rules (pricing, status transitions, validations)
- Use Bean Validation for input validation
- Return DTOs, never expose entities directly
- Log key events: order creation, status changes, payment creation

**Controller Layer Rules:**
- HTTP only, no business logic
- Thin controllers - delegate to services
- Align with OpenAPI contract exactly
- Use global error handler for consistent responses

**Repository Layer Rules:**
- JPA repositories only
- No business logic
- Use for persistence operations only

**Entity Design:**
- Match ERD exactly (`/docs/04-data-design/erd.dbml`)
- Use UUIDs for `users` table (PostgreSQL `gen_random_uuid()`)
- Use `bigserial` for other tables
- Enforce constraints: unique reference numbers, foreign keys, one-to-one payment relationship

**Data Flow (Order Creation):**
1. Staff selects/creates customer
2. Staff inputs weight + optional extra minutes + add-ons
3. Backend loads active service rate (`service_rates.is_active = true`)
4. Backend computes totals (see pricing formula above)
5. Backend generates unique `reference_number`
6. Backend stores order with `current_status = RECEIVED`, `payment_status = UNPAID`

### Frontend Architecture

**Structure:**
- Use **Next.js App Router** (not Pages Router)
- Keep API access in single client module
- TypeScript strict mode
- Tailwind CSS for styling (no additional CSS frameworks)

**API Integration:**
- Follow `/docs/05-tech-design/openapi.yaml` exactly
- Do NOT assume fields not defined in OpenAPI
- Handle errors using standard `ErrorResponse` schema
- Environment variable: `NEXT_PUBLIC_API_URL`

**Business Logic Rules:**
- **NEVER** hardcode pricing calculations
- **NEVER** duplicate backend business rules
- Display totals exactly as returned by backend
- All computations must come from API responses

**Public Tracking Page:**
- Only show: reference number, order status, created date, minimal summary
- **NEVER** expose: internal IDs, staff data, user information, full customer profiles

**UI/UX:**
- Use Tailwind CSS
- Avoid inline styles unless necessary
- Mobile-responsive by default
- Clear error messages using backend `ErrorResponse`

---

## Testing Standards

### Backend Testing

**Unit Tests:**
- Services: pricing logic, status transitions, payment validation
- Mock repositories in service tests
- Cover all business rule branches (BR-*)

**Integration Tests:**
- Use **Testcontainers** with PostgreSQL 16
- Do NOT mock the database for repository/integration tests
- Test repository operations with real DB
- Test API endpoints end-to-end
- Use `application-test.yml` for test configuration

**Test Coverage Targets:**
- All business rules (BR-*) must have tests
- All user stories (US-*) must have integration tests
- Critical paths: order creation, pricing, payment recording, status updates

### Frontend Testing

- Component tests for key UI flows
- API client integration tests
- E2E tests for critical user journeys (optional for MVP)

---

## Database Standards

**Schema Management:**
- Use Flyway migrations only
- Location: `backend/src/main/resources/db/migration`
- Naming: `V1__init.sql`, `V2__seed_users.sql`, etc.
- **NEVER** edit existing migrations after merge

**PostgreSQL Requirements:**
- Version 16
- Enable `pgcrypto` extension for UUID generation
- Use `gen_random_uuid()` for user IDs
- Use `bigserial` for auto-increment IDs

**Constraints to Enforce:**
- Unique `orders.reference_number`
- Unique `payments.order_id` (one-to-one relationship)
- Unique composite key on `customers(last_name, first_name, contact_number)`
- Foreign keys with proper cascade rules

**Enums (PostgreSQL):**
- `user_role`: OWNER, STAFF
- `order_status`: RECEIVED, WASHING, DRYING, FOLDING, READY_FOR_PICKUP, RELEASED, CANCELLED
- `payment_status`: UNPAID, PAID, PARTIAL
- `payment_method`: CASH, GCASH, BANK_TRANSFER
- `notification_status`: PENDING, SENT, FAILED

---

## Security & Access Control

**Role-Based Access:**
- **OWNER:** Reports, rates management, all operations
- **STAFF:** Orders, status updates, payments, customers (no reports access)

**Authentication:**
- Simple username/password for MVP
- JWT/session-based (implementation detail)
- Seed admin user in `V2__seed_users.sql`

**Public Endpoints:**
- Order tracking by reference number
- Limited data exposure (per BR-NOTIF-02)

---

## Error Handling Standards

**HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation or business rule violation
- `404 Not Found` - Resource not found
- `409 Conflict` - Uniqueness or state conflicts (e.g., duplicate reference number, payment already exists)

**Error Response Format:**
- Use `ErrorResponse` schema from OpenAPI
- Provide clear, user-friendly messages
- Include field-level validation errors when applicable

---

## Git Workflow & PR Standards

**Branching:**
- Branch per change
- PR into `develop` (not `main`)
- Branch naming: `feature/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`

**Conventional Commits:**
- `feat:` New feature (maps to user story)
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

**PR Template:**
- Use `.github/pull_request_template.md`
- List User Stories implemented (US-xx)
- List Business Rules enforced (BR-xx)
- Provide verification steps (commands/tests to run)

**PR Checklist:**
- [ ] Tests pass locally (`.\mvnw.cmd test` for backend)
- [ ] No hardcoded business rules in frontend
- [ ] Entities match ERD
- [ ] APIs match OpenAPI contract
- [ ] Documentation updated if behavior changed

---

## MVP Scope Boundaries

### In Scope (MVP)
- Staff/Owner authentication (username/password)
- Customer management (create/search)
- Order intake (weight, extra minutes, add-ons, pricing)
- Order status updates + audit trail
- Payment recording (one payment per order, exact amount only)
- Sales reporting (daily/monthly/yearly)
- Order tracking by reference number

### Out of Scope (MVP+)
- Partial payments, overpayments, owner override
- Item-level tracking of clothing pieces
- Machine maintenance monitoring
- Online booking/scheduling
- Advanced analytics dashboards
- Multi-branch support
- Email/SMS notifications (optional for MVP)

---

## Development Environment

**Local Setup:**
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- PostgreSQL: `docker compose -f docker/docker-compose.yml up -d`

**Environment Variables:**
- Backend: `.env` (DB connection, JWT secret)
- Frontend: `.env.local` (`NEXT_PUBLIC_API_URL`)
- Never commit secrets to Git
- Use `.env.example` as template

**CI/CD:**
- GitHub Actions (or similar)
- Run tests on PR
- Use Testcontainers for integration tests
- No secrets in CI logs

---

## Documentation Maintenance

**Docs-Driven Development:**
- Documentation is the source of truth
- If code behavior changes → docs must change first or in same PR
- Keep README.md updated with setup instructions

**Document Locations:**
- Case study & interview: `/docs/00-context/`
- Requirements: `/docs/02-requirements/`
- Data design: `/docs/04-data-design/`
- Tech design: `/docs/05-tech-design/`
- Implementation plan: `/docs/06-implementation/`

**When to Update Docs:**
- New user stories or business rules
- Schema changes (update ERD)
- API changes (update OpenAPI)
- Architecture changes (update architecture.md)
