# Business Rules Catalog
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** BR-CATALOG (BR-PR-*, BR-OL-*, BR-PAY-*, BR-REC-*, BR-NOTIF-*)  
> **Version:** 1.1  
> **Date:** 2026-02-20  
> **Source:** Client Interview & Case Study  
> **Purpose:** Define enforceable rules that drive backend logic, validation, and computations  
> **Status:** Baseline (MVP)

---

## Document Control
- **Document Type:** Requirements — Business Rules
- **Related Documents:** [Project Scope](../01-scope/project-scope.md), [User Stories](user-stories.md), [ERD](../04-data-design/erd.dbml), [Architecture](../05-tech-design/architecture.md), [OpenAPI Spec](../05-tech-design/openapi.yaml)
- **Confidentiality:** Internal / Academic Use

---

## 1. Pricing Rules

### BR-PR-01 – Base Load Pricing

**Rule:** One (1) load costs **₱140** and covers up to **8 kg**.  
**Condition:** Order creation or price computation.  
**System Behavior:** Apply base price per load.  
**Constraint:** Reject order if weight is missing or invalid.  
**Applies To:** Order creation / price computation  
**Enforcement:** Backend service  
**Supports User Stories:** [US-01](user-stories.md#us-01--record-laundry-order), [US-02](user-stories.md#us-02-automatically-compute-laundry-price)

---

### BR-PR-02 – Additional Load for Excess Weight

**Rule:** If laundry weight exceeds **8 kg**, the excess MUST be charged as an additional load.  
**Condition:** Weight exceeds 8 kg per load.  
**System Behavior:** Compute total loads as `ceil(weight_kg / kg_limit_per_load)`.  
**Constraint:** Each load covers at most 8 kg.  
**Applies To:** Order creation / price computation  
**Enforcement:** Backend service  
**Supports User Stories:** [US-02](user-stories.md#us-02-automatically-compute-laundry-price)

---

### BR-PR-03 – Extra Washing Time Charge

**Rule:** Washing time beyond the **included 45 minutes per load** is charged at **₱1 per extra minute**.  
**Condition:** Extra minutes are recorded.  
**System Behavior:** Apply `extra_minutes × price_per_extra_minute`.  
**Constraint:** Base price includes up to 45 minutes per load; if extra minutes are not provided, the charge is 0.  
**Applies To:** Order creation / price computation  
**Enforcement:** Backend service  
**Supports User Stories:** [US-02](user-stories.md#us-02-automatically-compute-laundry-price)

---

### BR-PR-04 – Optional Add-ons (e.g., Fabric Conditioner)

**Rule:** Additional charges may apply when the customer requests extra fabric conditioner or similar add-ons.  
**Condition:** Add-on requested.  
**System Behavior:** Add add-on amount to grand total.  
**Constraint:** Add-on pricing is configurable or recorded as a manual amount. **Canonical Names:** Staff should use consistent naming (e.g., "Fabric Conditioner") to support future reporting.

**Applies To:** Order creation / add-on handling  
**Enforcement:** Backend service  
**Supports User Stories:** [US-02](user-stories.md#us-02-automatically-compute-laundry-price)

---

### BR-PR-05 – Admin Controls Service Rates

**Rule:** The **Admin** MUST be able to update service rates (base price per load, kg limit, price per extra minute) without code changes.  
**Condition:** Admin requests rate update.  
**System Behavior:** Allow PATCH on service rates; apply to new orders only. Existing orders retain snapshot pricing.  
**Constraint:** Admin role only; changes do not affect already-created orders.  
**Applies To:** Service rates management  
**Enforcement:** Backend service with role-based access (ADMIN)  
**Supports User Stories:** Admin pricing control (client interview)

---

## 2. Order Lifecycle Rules

### BR-OL-01 – Order Must Have a Unique Reference Number

**Rule:** Every order MUST have a unique **reference number** used for tracking.  
**Condition:** Order creation or tracking lookup.  
**System Behavior:** Generate unique reference; enforce uniqueness.  
**Constraint:** Reject creation if reference exists (or regenerate).  
**Applies To:** Order creation, tracking portal  
**Enforcement:** Backend service + database unique constraint  
**Supports User Stories:** [US-01](user-stories.md#us-01-record-laundry-order), [US-04](user-stories.md#us-04-track-laundry-order-by-reference-number)

---

### BR-OL-02 – Initial Order Status

**Rule:** A newly created order MUST start with status **Received**.  
**Condition:** Order creation.  
**System Behavior:** Set `current_status = RECEIVED`.  
**Constraint:** No other initial status is allowed.  
**Applies To:** Order creation  
**Enforcement:** Backend service  
**Supports User Stories:** [US-01](user-stories.md#us-01-record-laundry-order)

---

### BR-OL-03 – Allowed Order Status Values

**Rule:** Order status MUST be one of: Received, Washing, Drying, Folding, Ready for Pickup, Released, Cancelled.  
**Condition:** Status update requested.  
**System Behavior:** Validate status; update if valid.  
**Constraint:** Reject invalid status values.  
**Applies To:** Status updates  
**Enforcement:** Backend service validation  
**Supports User Stories:** [US-03](user-stories.md#us-03-update-laundry-order-status), [US-05](user-stories.md#us-05-verify-laundry-before-release), [US-10](user-stories.md#us-10-notify-customer-when-laundry-is-ready)

---

### BR-OL-04 – Status Transition Control (Recommended)

**Rule:** Orders SHOULD follow a logical sequence of stages (no skipping backwards unless corrected by staff/Admin).  
**Condition:** Status update requested.  
**System Behavior:** Validate transition against allowed sequence.  
**Constraint:** Recommended for MVP+; not mandatory for MVP.  
**Applies To:** Status updates  
**Enforcement:** Backend service (recommended for MVP+)

**Suggested Allowed Transitions**
- Received → Washing
- Washing → Drying
- Drying → Folding
- Folding → Ready for Pickup
- Ready for Pickup → Released
- Any non-terminal status → Cancelled
- Cancelled → (terminal; no further transitions)

**Supports User Stories:** [US-03](user-stories.md#us-03-update-laundry-order-status)

---

### BR-OL-05 – Release Preconditions

**Rule:** An order can only be released if (1) its status is **Ready for Pickup**, and (2) payment has been recorded (**Paid**).  
**Condition:** Release action requested.  
**System Behavior:** Validate status and payment; allow release only if Ready for Pickup and Paid.  
**Constraint:** Reject release if not ready or if unpaid. Payment is collected upon pickup (see [BR-PAY-01](#br-pay-01--payment-timing)); release must follow payment.  
**Applies To:** Release action  
**Enforcement:** Backend service  
**Supports User Stories:** [US-05](user-stories.md#us-05-verify-laundry-before-release), [US-06](user-stories.md#us-06-record-payment-for-laundry-order)

---

### BR-OL-06 – Order Edit (Extra Minutes, Add-ons)

**Rule:** Staff or Admin MAY edit an order's **extra minutes** and **add-ons** when the order is **unpaid** and **not released**.  
**Condition:** Edit requested during processing (e.g. extended washing due to excessive dirt).  
**System Behavior:** Recalculate extra_minutes_amount, addons_total_amount, grand_total using order's snapshot pricing. Reject edit if paid or released.  
**Constraint:** Weight, base amount, and total_loads are immutable after creation.

**Applies To:** Order update (PATCH)  
**Enforcement:** Backend service  
**Supports User Stories:** [US-03](user-stories.md#us-03-update-laundry-order-status), Client interview Q9 (extra charge for extended washing)

---

## 3. Payment Rules

### BR-PAY-01 – Payment Timing

**Rule:** Payment is typically collected **upon pickup** (not drop-off).  
**Condition:** Payment recording workflow.  
**System Behavior:** Process rule (UI/flow).  
**Constraint:** Not a strict validation rule.  
**Applies To:** Payment recording workflow  
**Enforcement:** Process rule (UI/flow)  
**Supports User Stories:** [US-06](user-stories.md#us-06-record-payment-for-laundry-order)

---

### BR-PAY-02 – Payment Must Be Linked to an Order

**Rule:** Each payment MUST be associated with exactly one order.  
**Condition:** Payment creation.  
**System Behavior:** Enforce one-to-one relationship.  
**Constraint:** Database foreign key + backend validation.  
**Applies To:** Payment creation  
**Enforcement:** Database foreign key + backend validation  
**Supports User Stories:** [US-06](user-stories.md#us-06-record-payment-for-laundry-order), [US-07](user-stories.md#us-07-view-payment-history)

---

### BR-PAY-03 – Payment Amount Validation

**Rule:** Recorded payment amount MUST exactly match the order grand total.  
**Condition:** Payment creation.  
**System Behavior:** Validate amount; reject if mismatched.  
**Constraint:** MVP: strict matching only; partial payments, overpayments, Admin override are post-MVP (see [US-06](user-stories.md#us-06-record-payment-for-laundry-order)).  
**Applies To:** Payment creation  
**Enforcement:** Backend service  
**Supports User Stories:** [US-06](user-stories.md#us-06-record-payment-for-laundry-order)

---

### BR-PAY-04 – Payment Status

**Rule:** Payment status MUST be recorded as **Paid** or **Unpaid** (or derived from presence of payment).  
**Condition:** Order/payment view or reporting.  
**System Behavior:** Update or derive status from payment record.  
**Constraint:** MVP uses Paid and Unpaid only.  
**Applies To:** Order/payment view and reporting  
**Enforcement:** Backend service  
**Supports User Stories:** [US-06](user-stories.md#us-06-record-payment-for-laundry-order), [US-08](user-stories.md#us-08-view-daily-sales-report), [US-09](user-stories.md#us-09-view-monthly-and-yearly-income-reports)

---

### BR-PAY-05 – Payment Method Recorded

**Rule:** Each payment MUST record the **payment method** used: Cash, GCash, or Bank Transfer.  
**Condition:** Payment creation.  
**System Behavior:** Store selected payment method with the payment record.  
**Constraint:** For record-keeping only; no integration with payment gateways or providers.  
**Applies To:** Payment creation  
**Enforcement:** Backend service + database (payment_method column)  
**Supports User Stories:** [US-06](user-stories.md#us-06-record-payment-for-laundry-order), [US-07](user-stories.md#us-07-view-payment-history)

---

### BR-PAY-06 – Payment Reversals (Void vs Refund)

**Rule:** A payment record MUST be **Voided** if (1) the transaction was recorded in error, or (2) the external payment (e.g. GCash, Bank Transfer) is found to have failed or been reversed by the provider.  
**Condition:** Payment reversal requested.  
**System Behavior:** Set `Order.paymentStatus = VOIDED`. The Payment record is preserved for audit but excluded from revenue sums.  
**Constraint:** Reverts the order's financial impact; allows for recovery or re-payment. Only Admin or authorized Staff can perform a manual void without order cancellation.  
**Applies To:** Payment management  
**Enforcement:** Backend service  
**Supports User Stories:** [US-07](user-stories.md#us-07-view-payment-history), Admin audit needs

---

### BR-PAY-07 – Automatic Reversal on Cancellation

**Rule:** When a paid order is **Cancelled**, the associated payment status MUST automatically transition to **VOIDED** to ensure financial reports accurately reflect "Net Revenue."  
**Condition:** Order status changed to CANCELLED.  
**System Behavior:** Automatically update `paymentStatus = VOIDED` if current status is PAID or PARTIAL.  
**Constraint:** Prevents "ghost revenue" from unfulfilled orders.  
**Applies To:** Order status transition  
**Enforcement:** Backend service logic (OrderStatusService)  
**Supports User Stories:** [US-08](user-stories.md#us-08-view-daily-sales-report), [US-09](user-stories.md#us-09-view-monthly-and-yearly-income-reports)

---

## 4. Records & Retention Rules

### BR-REC-01 – Core Data to Record

**Rule:** The system MUST store at minimum: customer name and contact number, laundry order details, payment records, daily sales totals (derivable from payments).  
**Condition:** Data model, forms, reporting.  
**System Behavior:** Persist required data.  
**Constraint:** Data design requirement.  
**Applies To:** Data model, forms, reporting  
**Enforcement:** Data design requirement  
**Supports User Stories:** [US-01](user-stories.md#us-01-record-laundry-order), [US-07](user-stories.md#us-07-view-payment-history), [US-08](user-stories.md#us-08-view-daily-sales-report), [US-09](user-stories.md#us-09-view-monthly-and-yearly-income-reports)

---

### BR-REC-02 – Retention Reference (Optional for MVP)

**Rule:** Current manual practice keeps active records for about **one (1) month** before archiving.  
**Condition:** Records management feature.  
**System Behavior:** Optional for MVP.  
**Constraint:** Implement later as archiving/filtering.  
**Applies To:** Records management feature  
**Enforcement:** Optional for MVP  
**Supports User Stories:** None (optional for MVP)

---

## 5. Notifications & Tracking Rules

### BR-NOTIF-01 – Customer Ready Notification Trigger

**Rule:** The system SHOULD notify the customer when order status becomes **Ready for Pickup**.  
**Condition:** Status update to Ready for Pickup.  
**System Behavior:** Trigger notification; record notification.  
**Constraint:** MVP optional.  
**Applies To:** Status updates  
**Enforcement:** Backend event/trigger + notification service (MVP optional)  
**Supports User Stories:** [US-10](user-stories.md#us-10-notify-customer-when-laundry-is-ready)

---

### BR-NOTIF-02 – Tracking by Reference Number

**Rule:** Customers MUST be able to track laundry status using the order reference number.  
**Condition:** Customer requests tracking.  
**System Behavior:** Lookup by unique reference; return allowed fields only.  
**Constraint:** No sensitive or internal data exposed.  
**Applies To:** Tracking page/API  
**Enforcement:** Backend endpoint + lookup by unique reference  
**Supports User Stories:** [US-04](user-stories.md#us-04-track-laundry-order-by-reference-number)

---

## 6. MVP Enforcement Checklist

**Required for MVP:**
- BR-PR-01, BR-PR-02, BR-PR-03, BR-PR-05
- BR-OL-01, BR-OL-02, BR-OL-03, BR-OL-05, BR-OL-06
- BR-PAY-02, BR-PAY-03, BR-PAY-04, BR-PAY-05
- BR-NOTIF-02 (tracking by reference)

**Recommended next:**
- BR-OL-04 (status transitions)
- BR-NOTIF-01 (ready notifications)
