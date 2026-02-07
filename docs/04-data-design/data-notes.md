# Data Design Notes

## Scope
This ERD supports order tracking, pricing computation, payment recording, reporting, and customer notifications.

## Key Business Rules Supported
- ₱120 per load up to 8kg; weight above 8kg adds another load.
- Extra washing time is ₱1 per minute when recorded.
- Orders are tracked by a unique reference number.
- Payments are recorded for reporting and history.

## MVP vs Future
**MVP**
- Orders lifecycle: RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED
- Payment method: CASH
- Payment status: PAID / UNPAID

**Future (MVP+)**
- CANCELLED status
- PARTIAL payments
- Digital payment methods (GCASH, bank transfer)
- Notification sending retries/providers

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
