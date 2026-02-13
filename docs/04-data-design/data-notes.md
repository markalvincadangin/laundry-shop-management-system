# Data Design Notes
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** DATA-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Document data design decisions and traceability to Business Rules  
> **Status:** Baseline (Reference)

---

## Document Control
- **Document Type:** Data Design Notes
- **Related Documents:** [ERD (erd.dbml)](erd.dbml), [Project Scope](../01-scope/project-scope.md), [Business Rules](../02-requirements/business-rules.md), [User Stories](../02-requirements/user-stories.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Scope

This ERD supports order tracking, pricing computation, payment recording, reporting, and customer notifications. The schema is defined in [erd.dbml](erd.dbml).

---

## 2. Table-to-Business-Rule Mapping

| Table               | Business Rules                                                                  | User Stories               |
|---------------------|---------------------------------------------------------------------------------|----------------------------|
| `service_rates`     | BR-PR-01, BR-PR-02, BR-PR-03                                                    | US-02                      |
| `customers`         | BR-REC-01                                                                       | US-01                      |
| `orders`            | BR-PR-01, BR-PR-02, BR-PR-03, BR-PR-04, BR-OL-01, BR-OL-02, BR-OL-03, BR-PAY-04 | US-01, US-02, US-03, US-04 |
| `order_add_ons`     | BR-PR-04                                                                        | US-02                      |
| `order_status_logs` | BR-OL-03, BR-OL-04                                                              | US-03                      |
| `payments`          | BR-PAY-02, BR-PAY-03, BR-PAY-04, BR-REC-01                                      | US-06, US-07, US-08, US-09 |
| `users`             | —                                                                               | US-11                      |
| `notifications`     | BR-NOTIF-01                                                                     | US-10                      |

---

## 3. Key Design Decisions

### 3.1 Pricing Snapshot (BR-PR-01, BR-PR-02, BR-PR-03)

The `orders` table stores snapshot values (`base_price_per_load`, `kg_limit_per_load`, `price_per_extra_minute`) copied from `service_rates` at order creation. This ensures historical accuracy when the owner updates pricing rules. The `service_rate_id` foreign key indicates which service was used but is not relied upon for pricing calculations.

### 3.2 Unique Reference Number (BR-OL-01)

`orders.reference_number` has a UNIQUE constraint. Used for tracking lookup ([US-04](../02-requirements/user-stories.md#us-04-track-laundry-order-by-reference-number)).

### 3.3 One Payment per Order (BR-PAY-02)

`payments.order_id` has a UNIQUE constraint, enforcing a one-to-one relationship. MVP supports exactly one payment per order.

### 3.4 Payment Amount Validation (BR-PAY-03)

`payments.amount_paid` stores the recorded amount. Backend MUST validate that `amount_paid` equals `orders.grand_total` before persisting. No schema-level check; enforcement is in the service layer.

### 3.5 Order Status Lifecycle (BR-OL-02, BR-OL-03, BR-OL-05)

`orders.current_status` uses the `order_status` enum. The initial value is RECEIVED (BR-OL-02). All status changes are logged in `order_status_logs` for audit (US-03).

### 3.6 Customer Uniqueness (BR-REC-01)

`customers` has a unique composite index on `(last_name, first_name, contact_number)` to support duplicate detection.

---

## 4. MVP vs Future Schema Usage

**MVP (application usage)**
- `order_status`: RECEIVED, WASHING, DRYING, FOLDING, READY_FOR_PICKUP, RELEASED, CANCELLED (all used)
- `payment_status`: UNPAID, PAID only (PARTIAL reserved for post-MVP)
- `payment_method`: CASH only (GCASH, BANK_TRANSFER reserved for post-MVP)

**Post-MVP (schema already supports)**
- `payment_status`: PARTIAL
- `payment_method`: GCASH, BANK_TRANSFER

---

## 5. Integrity Constraints

| Constraint | Table.Column                                      | Rule                              |
|------------|---------------------------------------------------|-----------------------------------|
| UNIQUE     | orders.reference_number                           | BR-OL-01                          |
| UNIQUE     | payments.order_id                                 | BR-PAY-02 (one payment per order) |
| UNIQUE     | customers (last_name, first_name, contact_number) | BR-REC-01                         |
| NOT NULL   | orders.customer_id                                | —                                 |
| NOT NULL   | orders.created_by_user_id                         | —                                 |
| NOT NULL   | order_status_logs.order_id                        | —                                 |

---

## 6. Indexes

- `orders.reference_number` (unique) — tracking lookup (US-04)
- `payments.payment_date` — reporting (US-08, US-09)
- `orders.created_at` — filtering and dashboard queries

---

## 7. Technical Notes

- PostgreSQL: `gen_random_uuid()` requires the `pgcrypto` extension.
- All monetary values use `decimal(10,2)`.
- Timestamps use `timestamp` with `default: now()`.
