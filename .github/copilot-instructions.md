# Copilot Instructions — Faith Laundry Shop Management System

## Primary source of truth (must follow)
- Requirements: /docs/02-requirements/user-stories.md
- Business rules: /docs/02-requirements/business-rules.md
- Data model: /docs/04-data-design/erd.dbml (and erd.svg)
- API contract: /docs/05-tech-design/openapi.yaml
- Architecture: /docs/05-tech-design/architecture.md

If any suggestion conflicts with these documents:
1) explicitly point out the conflict (file + section), and
2) propose the smallest possible fix.
   Do NOT invent new behavior.

---

## Tech stack (must follow exactly)
- Backend: Java **21 (LTS)**, Spring Boot **3.3+**, **Maven**
- Frontend: **Next.js 14+**, React, **TypeScript**, Tailwind CSS
- Database: **PostgreSQL 16**
- Migrations: **Flyway**
- Infrastructure: **Docker & Docker Compose**
- Testing: **JUnit 5 + Testcontainers**

Do not suggest:
- Gradle
- older Spring Boot patterns
- different databases
- alternative migration tools

---

## Non-hallucination rules
- Do not invent endpoints, database fields, enums, statuses, pricing rules, or roles.
- Do not assume features marked as MVP+ unless explicitly enabled.
- If unsure, ask for clarification or cite the document used.
- Prefer minimal, incremental changes.

---

## Domain rules (MVP)
- Pricing:
    - ₱120 per load up to 8kg
    - total_loads = ceil(weight_kg / kg_limit_per_load)
    - extra_minutes charged at ₱1 per minute
    - add-ons are flexible line items
- Payments:
    - exactly one payment per order
    - payment amount must match order.grand_total (unless owner override is added)
- Order lifecycle:
    - RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED

---

## Implementation standards
### Backend
- Enforce all business rules in the **service layer**
- Validate inputs using Bean Validation
- Keep controllers thin
- Keep APIs aligned with OpenAPI
- Keep entities aligned with ERD

### Frontend
- Do not hardcode pricing or business rules
- Display totals exactly as returned by backend
- Public tracking endpoints must not expose internal IDs or staff data

---

## Testing rules
- Use **Testcontainers** for integration tests with PostgreSQL 16
- Do not mock the database for repository/integration tests
- Unit tests for services; integration tests for persistence and API flows

---

## Workflow rules (Git)
- Branch per change; PR into `develop`
- Use Conventional Commits:
    - feat:, fix:, docs:, refactor:, test:, chore:
- Use the repository PR template: `.github/pull_request_template.md`
- Every PR must list:
    - User stories implemented (US-xx)
    - Business rules enforced (BR-xx)
    - Verification steps (commands/tests)