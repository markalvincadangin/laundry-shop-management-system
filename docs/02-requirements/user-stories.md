# User Stories
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** US-CATALOG (US-01 through US-14)  
> **Version:** 1.2  
> **Date:** 2026-07-24  
> **Source:** Client Interview & Case Study  
> **Purpose:** Define functional behavior for implementation  
> **Status:** Baseline (MVP)

---

## Document Control
- **Document Type:** Requirements — User Stories
- **Related Documents:** [Project Scope](../01-scope/project-scope.md), [Business Rules](business-rules.md), [Non-Functional Requirements](non-functional-requirements.md), [Case Study](../00-context/case-study.md), [Client Interview](../00-context/client-interview.md), [OpenAPI Spec](../05-tech-design/openapi.yaml)
- **Confidentiality:** Internal / Academic Use

### Revision History
| Version | Date       | Author   | Changes |
|---------|------------|----------|---------|
| 1.0     | 2026-02-13 | HIMÓTECH  | Initial baseline |
| 1.1     | 2026-02-20 | HIMÓTECH  | Baseline MVP release |
| 1.2     | 2026-07-24 | HIMÓTECH  | Standardized `tracking_number` terminology and UUID data model |

---

## 1. Epic 1: Order Intake & Management

### US-01 – Record Laundry Order

**As a** staff or admin  
**I want** to record a laundry order with customer and laundry details  
**So that** the system can track the order from drop-off to pickup.

**Acceptance Criteria**
- Customer name and contact number are required
- Laundry weight (kg) is required
- Order date is recorded automatically
- System generates a unique tracking number (`tracking_number`)
- Initial order status is set to **Received**
- Staff MAY assign machines during intake if they are immediately available

**Related Business Rules:** [BR-OL-01](business-rules.md#br-ol-01-order-must-have-a-unique-tracking-number), [BR-OL-02](business-rules.md#br-ol-02-initial-order-status), [BR-REC-01](business-rules.md#br-rec-01-core-data-to-record), [BR-MAC-03](business-rules.md#br-mac-03-hoarding-prevention)
**Scope:** [§ 3.1.1 Order Intake & Management](../01-scope/project-scope.md#311-order-intake-management)

---

### US-02 – Automatically Compute Laundry Price

**As a** staff or admin  
**I want** the system to compute the laundry price automatically  
**So that** pricing errors and manual calculations are avoided.

**Acceptance Criteria**
- One (1) load costs **₱140** and covers up to **8 kg**
- Total loads: `ceil(weight_kg / 8)`; exact multiples of 8 kg use `weight_kg / 8`
- Each load includes up to **45 minutes** of washing time in the base price
- Extra minutes (beyond 45 per load) are charged at **₱1 per minute**
- Staff records extra minutes before the system computes the price
- Computed total is displayed before saving

**Related Business Rules:** [BR-PR-01](business-rules.md#br-pr-01-base-load-pricing), [BR-PR-02](business-rules.md#br-pr-02-additional-load-for-excess-weight), [BR-PR-03](business-rules.md#br-pr-03-extra-washing-time-charge), [BR-PR-04](business-rules.md#br-pr-04-optional-add-ons-eg-fabric-conditioner)  
**Scope:** [§ 3.1.1 Order Intake & Management](../01-scope/project-scope.md#311-order-intake-management)

---

### US-03 – Update Laundry Order Status

**As a** staff or admin  
**I want** to update the laundry order status  
**So that** the current processing stage is accurately reflected.

**Acceptance Criteria**
- Allowed statuses: Received, Washing, Drying, Folding, Ready for Pickup, Released, Cancelled
- Status changes are recorded with a timestamp
- Only existing orders can have their status updated
- When moving to WASHING or DRYING, staff MUST assign machines without exceeding the total loads required.

**Related Business Rules:** [BR-OL-03](business-rules.md#br-ol-03-allowed-order-status-values), [BR-OL-04](business-rules.md#br-ol-04-status-transition-control-recommended), [BR-MAC-03](business-rules.md#br-mac-03-hoarding-prevention)
**Scope:** [§ 3.1.2 Order Lifecycle Tracking](../01-scope/project-scope.md#312-order-lifecycle-tracking)

---

### US-13 – Process Rush Orders

**As a** customer or staff  
**I want** to record orders as "Rush"  
**So that** expedited processing is priced correctly and prioritized.

**Acceptance Criteria**
- System applies a special "Rush Wash" active service rate instead of standard rates.
- Rush orders are clearly marked/badged in the UI so staff can prioritize them during peak hours.

**Related Business Rules:** [BR-PR-06](business-rules.md#br-pr-06-rush-order-pricing)
**Scope:** [§ 3.1.1 Order Intake & Management](../01-scope/project-scope.md#311-order-intake-management)

---

## 8. Epic 8: System Configuration

### US-14 – Manage Service Rates & Pricing

**As the** admin  
**I want** to manage the available laundry service rates  
**So that** I can fully customize my laundry business offerings (e.g., Blankets, Rush) in the future without needing developer assistance.

**Acceptance Criteria**
- Admin can view, add, edit, and deactivate service rates.
- Each rate defines a base price, kg limit per load, and extra minute charge.
- Deactivating a rate prevents it from being used in new orders but preserves it for historical order integrity.
- At least one active rate MUST always exist to prevent order intake from failing.

**Related Business Rules:** [BR-PR-05](business-rules.md#br-pr-05-admin-controls-service-rates)
**Scope:** [§ 3.1.6 User Roles](../01-scope/project-scope.md#316-user-roles-basic-access-control)

---

## 2. Epic 2: Order Tracking & Release

### US-04 – Track Laundry Order by Tracking Number

**As a** customer  
**I want** to track my laundry order using a tracking number  
**So that** I can check the status without asking the staff.

**Acceptance Criteria**
- Customer can enter an order tracking number (`tracking_number`)
- System displays current order status, order date, and service summary
- Invalid tracking numbers show a clear error message

**Related Business Rules:** [BR-NOTIF-02](business-rules.md#br-notif-02-tracking-by-tracking-number), [BR-OL-01](business-rules.md#br-ol-01-order-must-have-a-unique-tracking-number)  
**Scope:** [§ 3.1.5 Order Tracking](../01-scope/project-scope.md#315-order-tracking-customer-facing)

---

### US-05 – Verify Laundry Before Release

**As a** staff or admin  
**I want** to verify laundry details before releasing the order  
**So that** incorrect items are not given to customers.

**Acceptance Criteria**
- System displays order details, current status, and payment status
- Release button is disabled unless (1) status is **Ready for Pickup** and (2) payment status is **Paid**
- Confirmation prompt before completing release

**Related Business Rules:** [BR-OL-05](business-rules.md#br-ol-05-release-preconditions-ready--paid)  
**Scope:** [§ 3.1.2 Order Lifecycle Tracking](../01-scope/project-scope.md#312-order-lifecycle-tracking)

---

## 3. Epic 3: Payments & Financials

### US-06 – Record Payment

**As a** staff or admin  
**I want** to record customer payment for an order  
**So that** the system tracks order payment status and revenue.

**Acceptance Criteria**
- Payment amount must equal order grand total (full payment only for MVP)
- Payment method (Cash, GCash, Bank Transfer) is recorded
- Payment timestamp and recording user are saved
- Payment status automatically updates to **Paid**

**Related Business Rules:** [BR-PAY-01](business-rules.md#br-pay-01-full-payment-required-mvp-restriction), [BR-PAY-02](business-rules.md#br-pay-02-payment-must-be-linked-to-an-order), [BR-PAY-03](business-rules.md#br-pay-03-supported-payment-methods), [BR-PAY-04](business-rules.md#br-pay-04-payment-status)  
**Scope:** [§ 3.1.3 Payment Recording](../01-scope/project-scope.md#313-payment-recording)

---

### US-07 – View Payment History

**As the** admin  
**I want** to view payment records  
**So that** I can review transaction history.

**Acceptance Criteria**
- Payments can be filtered by date range
- Each payment shows order tracking number (`tracking_number`) and amount
- Only the admin can access the full payment history

**Related Business Rules:** [BR-REC-01](business-rules.md#br-rec-01-core-data-to-record), [BR-PAY-02](business-rules.md#br-pay-02-payment-must-be-linked-to-an-order)  
**Scope:** [§ 3.1.6 User Roles](../01-scope/project-scope.md#316-user-roles-basic-access-control)

---

## 4. Epic 4: Records & Reporting

### US-08 – View Daily Sales Report

**As the** admin  
**I want** to view daily sales automatically  
**So that** I do not need to compute income manually.

**Acceptance Criteria**
- System shows total daily income
- The number of completed orders is displayed
- Data is based on recorded payments only

**Related Business Rules:** [BR-REC-01](business-rules.md#br-rec-01-core-data-to-record), [BR-PAY-04](business-rules.md#br-pay-04-payment-status)  
**Scope:** [§ 3.1.4 Reporting](../01-scope/project-scope.md#314-reporting)

---

### US-09 – View Monthly and Yearly Income Reports

**As the** admin  
**I want** to view monthly and yearly income reports  
**So that** I can monitor business performance over time.

**Acceptance Criteria**
- Reports can be filtered by month and year
- Total income is computed automatically
- Only completed and paid orders are included

**Related Business Rules:** [BR-REC-01](business-rules.md#br-rec-01-core-data-to-record), [BR-PAY-04](business-rules.md#br-pay-04-payment-status)  
**Scope:** [§ 3.1.4 Reporting](../01-scope/project-scope.md#314-reporting)

---

## 5. Epic 5: Customer Communication

### US-10 – Notify Customer When Laundry Is Ready

**As a** customer  
**I want** to receive a notification when my laundry is ready  
**So that** I know when to pick it up.

**Acceptance Criteria**
- Notification is triggered when status becomes **Ready for Pickup**
- Notification includes order tracking number (`tracking_number`)
- Notification channel may be SMS or digital message

**Related Business Rules:** [BR-NOTIF-01](business-rules.md#br-notif-01-customer-ready-notification-trigger), [BR-OL-03](business-rules.md#br-ol-03-allowed-order-status-values)  
**Scope:** [§ 3.1.5 Order Tracking](../01-scope/project-scope.md#315-order-tracking-customer-facing); [§ 4 Out-of-Scope](../01-scope/project-scope.md#4-out-of-scope-excluded-from-mvp) (notification storage may exist)

---

## 6. Epic 6: User Access & Control

### US-11 – User Login and Role-Based Access

**As a** system user  
**I want** to log in based on my role  
**So that** I can access appropriate system features.

**Acceptance Criteria**
- User roles: **Admin** and **Staff**
- Admin: access to reports and records
- Staff: manage orders and payments; no access to income reports

**Related Business Rules:** None (role definitions in [Architecture](../05-tech-design/architecture.md))  
**Scope:** [§ 3.1.6 User Roles](../01-scope/project-scope.md#316-user-roles-basic-access-control)

---

## 7. MVP Scope (Initial Implementation)

The following user stories are required for the MVP (aligned with [Project Scope § 3.1](../01-scope/project-scope.md#31-in-scope-minimum-viable-product)):

- US-01 Record Laundry Order
- US-02 Automatically Compute Laundry Price
- US-03 Update Laundry Order Status
- US-04 Track Laundry Order by Tracking Number
- US-05 Verify Laundry Before Release
- US-06 Record Payment
- US-07 View Payment History
- US-08 View Daily Sales Report
- US-09 View Monthly and Yearly Income Reports
- US-11 User Login and Role-Based Access
- US-12 Track Machine Inventory
- US-13 Process Rush Orders
- US-14 Manage Service Rates & Pricing

---

## 8. Epic 7: Machine & Inventory Management

### US-12 – Track Machine Inventory

**As a** staff or admin
**I want** to track the physical laundry machines
**So that** I know which machines are available, in-use, or out of service.

**Acceptance Criteria**
- View a list of all laundry machines.
- Add or remove machines from the inventory (max 50 machines).
- Assign available machines to orders during intake or when changing status to WASHING or DRYING.
- A machine cannot be double-assigned to multiple active orders.
- The UI MUST visually disable machines that are already in-use or out of service.

**Related Business Rules:** [BR-MAC-01](business-rules.md#br-mac-01-multi-load-capacity-guarantee), [BR-MAC-02](business-rules.md#br-mac-02-assignment-flexibility), [BR-MAC-03](business-rules.md#br-mac-03-hoarding-prevention), [BR-MAC-04](business-rules.md#br-mac-04-max-machine-limit)
**Scope:** [§ 3.1.1 Order Intake & Management](../01-scope/project-scope.md#311-order-intake-management)
