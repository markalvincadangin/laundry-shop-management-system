# Data Design Notes
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** DATA-001  
> **Version:** 2.0  
> **Date:** 2026-04-26  
> **Purpose:** Document data design decisions and traceability to Business Rules  
> **Status:** Updated — Synced with Flyway V1__init.sql

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
| `activity_logs`     | BR-OL-03, BR-OL-04 (forensic audit via DB triggers)                             | US-03, US-05               |
| `payments`          | BR-PAY-02, BR-PAY-03, BR-PAY-04, BR-REC-01                                      | US-06, US-07, US-08, US-09 |
| `users`             | —                                                                               | US-11                      |
| `notifications`     | BR-NOTIF-01                                                                     | US-10                      |

---

## 3. Key Design Decisions

### 3.1 Pricing Snapshot (BR-PR-01, BR-PR-02, BR-PR-03)

The `orders` table stores snapshot values (`base_price_per_load`, `kg_limit_per_load`, `price_per_extra_minute`) copied from `service_rates` at order creation. **Additionally, `total_loads` is stored as a snapshot value** (intentional denormalization for display convenience and historical accuracy). This ensures historical accuracy when the Admin updates pricing rules. The `service_rate_id` foreign key indicates which service was used but is not relied upon for pricing calculations.

### 3.2 Unique Reference Number (BR-OL-01)

`orders.reference_number` has a UNIQUE constraint. Used for tracking lookup ([US-04](../02-requirements/user-stories.md#us-04-track-laundry-order-by-reference-number)).

### 3.3 One Payment per Order (BR-PAY-02)

`payments.order_id` has a UNIQUE constraint, enforcing a one-to-one relationship. MVP supports exactly one payment per order.

### 3.4 Payment Amount Validation (BR-PAY-03)

`payments.amount_paid` stores the recorded amount. Backend MUST validate that `amount_paid` equals `orders.grand_total` before persisting. No schema-level check; enforcement is in the service layer.

### 3.5 Order Status Lifecycle (BR-OL-02, BR-OL-03, BR-OL-05)

`orders.current_status` stores the current lifecycle stage. The initial value is RECEIVED (BR-OL-02). All mutations to `orders` (including status updates) are automatically captured in `activity_logs` via the `trg_audit_orders` database trigger, providing a tamper-resistant forensic audit trail (US-03, US-05). The `old_data` and `new_data` JSONB snapshots allow reconstruction of any state transition.

### 3.7 Forensic Audit Trail (activity_logs)

The system uses a **database-level trigger pattern** for forensic auditing instead of an application-managed `order_status_logs` table. The `fn_audit_activity()` PL/pgSQL function fires `AFTER INSERT OR UPDATE OR DELETE` on `orders`, `payments`, `customers`, and `service_rates`, writing full JSONB snapshots (`old_data`, `new_data`) to `activity_logs`.

The acting user is captured via `current_setting('app.current_user_id', true)`, which is set by a Spring Boot AOP aspect before each write operation.

**Advantages over application-level logging:**
- Guaranteed audit capture even if the application layer fails or bypasses service methods
- Covers any direct DB writes during maintenance or migration
- Single function maintains all audit records with consistent schema

### 3.6 Customer Uniqueness (BR-REC-01)

`customers` has a unique composite index on `(last_name, first_name, contact_number)` to support duplicate detection.

---

## 4. MVP vs Future Schema Usage

**MVP (application usage)**
- `order_status`: RECEIVED, WASHING, DRYING, FOLDING, READY_FOR_PICKUP, RELEASED, CANCELLED (all used)
- `payment_status`: UNPAID, PAID only (PARTIAL reserved for post-MVP)
- `payment_method`: CASH, GCASH, BANK_TRANSFER (all used in MVP for recording how the customer paid; no gateway integration)

**Post-MVP (schema already supports)**
- `payment_status`: PARTIAL (e.g., partial payments)
- Payment gateway integration (API integration with providers) — out of scope for MVP

---

## 5. Integrity Constraints

| Constraint | Table.Column                                      | Rule                              |
|------------|---------------------------------------------------|-----------------------------------|
| UNIQUE     | orders.reference_number                           | BR-OL-01                          |
| UNIQUE     | payments.order_id                                 | BR-PAY-02 (one payment per order) |
| UNIQUE     | customers (last_name, first_name, contact_number) | BR-REC-01                         |
| NOT NULL   | orders.customer_id                                | —                                 |
| NOT NULL   | orders.created_by_user_id                         | —                                 |
| CHECK      | orders.reference_number format                    | BR-OL-01                          |
| CHECK      | orders (weight, loads, grand_total)               | DATA-001 (Integrity)              |
| CHECK      | payments (amount_paid > 0)                        | BR-PAY-03                         |
| CHECK      | customers.contact_number format                   | BR-REC-01                         |
| CHECK      | order_add_ons (quantity, price)                   | BR-PR-04                          |

---

## 6. Indexes

- `orders.reference_number` (unique) — tracking lookup (US-04)
- `payments.payment_date` — reporting (US-08, US-09)
- `orders (customer_id, created_at DESC)` — composite index for customer order history
- `orders.current_status` — dashboard status filtering
- `orders.payment_status` — dashboard payment filtering
- `activity_logs (table_name, record_id)` — entity-level audit history lookup
- `activity_logs (created_at DESC)` — chronological activity log browsing

---

---

## 7. Technical Notes & Standards

### 7.1 Enum Standardization (VARCHAR vs NATIVE ENUM)
The system uses `VARCHAR` for all status and role columns. 
- **Rationale**: PostgreSQL Native Enums are strict and cause "operator does not exist" errors when queried via standard Spring Boot/Hibernate drivers without explicit casting. `VARCHAR` ensures seamless JPA compatibility and allows easier schema evolution (e.g., adding a new status) without downtime.
- **Enforcement**: Validation is strictly enforced in the Java Service Layer using `@Enumerated(EnumType.STRING)`.

### 7.2 Monetary Values
- **Type**: `decimal(10,2)` is used for all currency fields to ensure precision and avoid floating-point errors (HCI/Financial compliance).

### 7.3 Performance Strategy (Indexing)
- **Reference Tracking**: `orders.reference_number` is indexed for $O(1)$ tracking lookups.
- **Reporting**: `payments.payment_date` is indexed to ensure income reports (Daily/Monthly/Yearly) remain fast even with thousands of transactions.
- **Auditability**: `order_status_logs.order_id` is indexed to facilitate quick "Timeline" rendering in the order details view.
- **Staff Dashboard**: `orders.current_status` and `orders.payment_status` are indexed for high-frequency filtering.
- **Customer History**: A composite index `(customer_id, created_at DESC)` ensures lightning-fast retrieval of a customer's recent orders.

### 7.4 Security
- **UUID**: `users.id` uses random UUIDs to prevent user-count enumeration.
- **Audit Trail**: Every status change is linked to a `user_id` and `timestamp` for non-repudiation.

### 7.5 Data Refresh Strategy (Triggers)
- **Automatic Timestamps**: The `updated_at` column in `orders`, `customers`, `users`, and `service_rates` is automatically maintained via `BEFORE UPDATE` PostgreSQL triggers (`trg_*_updated_at`). This prevents stale timestamps caused by application-layer patching omissions.
- **Forensic Audit**: `AFTER INSERT OR UPDATE OR DELETE` triggers (`trg_audit_*`) on `orders`, `payments`, `customers`, and `service_rates` invoke `fn_audit_activity()`, which writes full JSONB snapshots to `activity_logs`. The acting user is injected via the `app.current_user_id` session variable set by Spring Boot AOP.

### 7.6 Notification Normalization
- **3NF Compliance**: `customer_id` has been removed from the `notifications` table to eliminate transitive dependency (derivable via `order_id`). This change is now reflected in `erd.dbml` and `schema.sql`.
- **Channel Support**: A `channel` column (`SMS`, `IN_APP`) distinguishes delivery methods.
- **Read Tracking**: An `is_read BOOLEAN DEFAULT FALSE` column has been added to track whether in-app notifications have been acknowledged by staff.
