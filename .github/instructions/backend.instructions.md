---
applyTo: "backend/**"
---

## Backend Instructions — Spring Boot 3.3+

### Stack
- Java 21 (LTS)
- Spring Boot 3.3+
- Maven
- PostgreSQL 16
- Flyway
- Testcontainers

---

## Architecture rules
- Layered architecture:
    - Controller → Service → Repository
- Controllers:
    - HTTP only
    - No business logic
- Services:
    - Enforce pricing, status transitions, validations
- Repositories:
    - JPA repositories only
    - No business logic

---

## Data & schema rules
- Database schema must match `/docs/04-data-design/erd.dbml`
- Use Flyway migrations:
    - Location: `backend/src/main/resources/db/migration`
    - Never edit existing migrations after merge
- Use PostgreSQL-compatible types and syntax

---

## Business logic rules
- Pricing is computed server-side only
- Persist computed totals:
    - base_amount
    - extra_minutes_amount
    - addons_total_amount
    - grand_total
- Enforce:
    - one payment per order
    - valid order status transitions
    - reference_number uniqueness

---

## Validation rules (minimum)
- weightKg > 0
- extraMinutes >= 0
- payment.amountPaid == order.grandTotal
- status updates must be valid enum values

---

## Testing rules
- Unit tests:
    - Services (pricing, transitions)
- Integration tests:
    - Repositories
    - API endpoints
- Use **Testcontainers** for PostgreSQL
- Do not mock repositories in integration tests

---

## Error handling
- Use the ErrorResponse schema from OpenAPI
- 400: validation or business rule violation
- 404: resource not found
- 409: uniqueness or state conflicts (when applicable)
