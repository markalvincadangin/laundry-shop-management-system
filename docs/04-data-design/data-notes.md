# Data Design Notes

## Scope
This ERD supports order tracking, pricing computation, payment recording, reporting, and customer notifications.

## Key Business Rules Supported
- ₱120 per load up to 8kg; weight above 8kg adds another load.
- Extra washing time is ₱1 per minute when recorded.
- Orders are tracked by a unique reference number.
- Payments are recorded for reporting and history.

## MVP vs Future
**MVP (application usage)**
- Orders lifecycle (MVP-used subset of `order_status` enum): RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED
- Payment method (MVP-used subset of `payment_method` enum): CASH
- Payment status (MVP-used subset of `payment_status` enum): PAID / UNPAID

**Future (MVP+ application behavior; already supported by schema enums)**
- Additional order statuses already present in `order_status` enum (e.g., CANCELLED)
- Additional payment statuses already present in `payment_status` enum (e.g., PARTIAL)
- Additional digital payment methods already present in `payment_method` enum (e.g., GCASH, bank_transfer)
- Operational features not modeled in the current ERD, such as notification sending retries/providers

## Technical Notes
- PostgreSQL: `gen_random_uuid()` requires `pgcrypto` extension.
- Store both inputs (weight_kg, extra_minutes, add-ons) and computed totals (base_amount, extra_minutes_amount, addons_total_amount, grand_total) to preserve historical accuracy when rates change.

## Integrity Constraints
- `orders.reference_number` must be UNIQUE
- One payment per order: `payments.order_id` UNIQUE
- `orders.customer_id` NOT NULL
- `orders.created_by_user_id` NOT NULL
- `order_status_logs.order_id` NOT NULL

## Indexes
- `orders.reference_number` (unique index) for tracking lookup
- `payments.payment_date` for reporting
- `orders.created_at` for filtering and dashboard queries
