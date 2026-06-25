# User Stories and Use Cases
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** UC-001  
> **Version:** 1.1  
> **Date:** 2026-05-17  
> **Purpose:** Describe system functionality from the perspective of end-users  
> **Status:** Baseline

---

## Document Control
- **Document Type:** User Requirements
- **Primary Source:** Client Interview & Case Study
- **Related Documents:** [Business Rules](10-business-rules.md), [Functional Requirements Matrix](13-functional-requirements-matrix.md)
- **Confidentiality:** Internal / Academic Use

---

This document describes the required system functionality from the perspective of the end-users. Each user story follows the standard format: "As a [role], I want [capability] so that [benefit]." Acceptance criteria define the conditions that must be satisfied for a story to be considered complete.

## 1. Epic 1: Order Intake and Management

### US-01 — Record Laundry Order
**As a** staff or admin, **I want** to record a laundry order with customer and laundry details **so that** the system can track the order from drop-off to pickup.

**Acceptance Criteria:**
- Customer name and contact number are required.
- Laundry weight (kg) is required.
- Order date is recorded automatically.
- System generates a unique reference number in the format `LDR-XXXXXXXX-XXXX`.
- Initial order status is set to **Received**.

### US-02 — Automatically Compute Laundry Price
**As a** staff or admin, **I want** the system to compute the laundry price automatically **so that** pricing errors and manual calculations are avoided.

**Acceptance Criteria:**
- One (1) load covers up to 8 kg; total loads are computed as `ceil(weight_kg / kg_limit)`.
- Base pricing is determined by the selected service rate (e.g., Standard Wash at ₱140/load).
- Each load includes up to 45 minutes of washing time in the base price.
- Extra minutes beyond 45 per load are charged at the per-extra-minute rate (e.g., ₱1.00/min for Standard Wash).
- Staff records extra minutes before the system computes the final price.
- Computed total (base amount + extra minutes + add-ons) is displayed before saving.

### US-03 — Update Laundry Order Status
**As a** staff or admin, **I want** to update the laundry order status **so that** the current processing stage is accurately reflected.

**Acceptance Criteria:**
- Allowed statuses: Received, Washing, Drying, Folding, Ready for Pickup, Released, Cancelled.
- Status changes are recorded with a timestamp and the user who performed the change.
- Only existing orders can have their status updated.
- Orders follow a logical status progression; backward transitions are not allowed.

## 2. Epic 2: Order Tracking and Release

### US-04 — Track Laundry Order by Reference Number
**As a** customer, **I want** to track my laundry order using a reference number **so that** I can check the status without asking the staff.

**Acceptance Criteria:**
- Customer can enter an order reference number on the public tracking page.
- System displays current order status, order date, service summary, and timestamped status history.
- Invalid reference numbers show a clear error message.
- No sensitive or internal data (e.g., pricing, staff details) is exposed.

### US-05 — Verify and Release Laundry
**As a** staff or admin, **I want** to verify laundry details and record payment before releasing the order **so that** incorrect items are not given to customers and revenue is collected.

**Acceptance Criteria:**
- Staff can view order and customer details before release.
- Order must be in **Ready for Pickup** status before release.
- Payment must be recorded (**Paid**) before release — release is not allowed for unpaid orders.
- Order status is updated to **Released** after successful verification and payment.

## 3. Epic 3: Payments and Transactions

### US-06 — Record Payment for Laundry Order
**As a** staff or admin, **I want** to record customer payments **so that** payment history is properly tracked.

**Acceptance Criteria:**
- Payment is linked to exactly one order.
- Payment amount must exactly match the order grand total (full payments only in the current version).
- Payment method (Cash, GCash, or Bank Transfer) is recorded for each payment.
- Payment date is recorded automatically.
- Order payment status is updated to **Paid** upon successful recording.

### US-07 — View Payment History
**As the** admin, **I want** to view payment records **so that** I can review transaction history.

**Acceptance Criteria:**
- Payments are displayed in a paginated, searchable table.
- Each payment shows order reference number, customer name, amount, payment method, receiving staff, and date.
- Payment records are accessible to both Admin and Staff roles.

## 4. Epic 4: Records and Reporting

### US-08 — View Daily Sales Report
**As the** admin, **I want** to view daily sales automatically **so that** I do not need to compute income manually.

**Acceptance Criteria:**
- System shows total daily revenue.
- The number of paid orders is displayed.
- Average order value is computed.
- Data is based on recorded payments only; voided payments are excluded.

### US-09 — View Monthly Income Reports
**As the** admin, **I want** to view monthly income reports **so that** I can monitor business performance over time.

**Acceptance Criteria:**
- Reports can be filtered by month and year.
- Total income is computed automatically.
- Revenue charts and order volume trends are displayed visually.
- Only paid and non-voided orders are included in revenue calculations.

## 5. Epic 5: Customer Communication

### US-10 — Notify Customer When Laundry Is Ready
**As a** customer, **I want** to receive a notification when my laundry is ready **so that** I know when to pick it up.

**Acceptance Criteria:**
- Notification is triggered when order status becomes **Ready for Pickup**.
- Notification includes the order reference number.
- Notification channel is SMS via the Semaphore.co API.
- Client alert records are logged in the system for audit purposes.

## 6. Epic 6: User Access and Control

### US-11 — User Login and Role-Based Access
**As a** system user, **I want** to log in based on my role **so that** I can access appropriate system features.

**Acceptance Criteria:**
- User roles: **Admin** and **Staff**.
- Admin: full access to all modules including reports, user management, service rates, and audit logs.
- Staff: manage orders, customers, and payments; no access to reports, user management, or service rate configuration.
- Authentication uses JWT tokens with session-based expiration.

## 7. Use Case Diagram Description

**Actors:**
1. **Staff:** Handles day-to-day operations including creating orders, updating status, recording payments, and managing customers.
2. **Admin:** Oversees the entire shop, views reports, manages system settings (service rates, user accounts), and reviews audit logs.
3. **Customer (External):** Tracks order status via the public tracking portal. Does not have system credentials.

**Core Use Cases:**
- Manage Customers (Staff, Admin)
- Manage Laundry Orders (Staff, Admin)
- Process Payments (Staff, Admin)
- Track Order Status (Customer — public)
- Generate Sales Reports (Admin only)
- Manage Service Rates (Admin only)
- Manage Users (Admin only)
- View Audit Logs (Admin only)
- Send Customer Notifications (System — automated)

## 8. MVP Scope

The following user stories are required for the Minimum Viable Product:
- US-01 Record Laundry Order
- US-02 Automatically Compute Laundry Price
- US-03 Update Laundry Order Status
- US-04 Track Laundry Order by Reference Number
- US-05 Verify and Release Laundry
- US-06 Record Payment
- US-07 View Payment History
- US-08 View Daily Sales Report
- US-09 View Monthly Income Reports
- US-11 User Login and Role-Based Access
