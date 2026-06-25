# Test Plan and Test Cases
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** TEST-001  
> **Version:** 1.1  
> **Date:** 2026-05-17  
> **Purpose:** Define testing strategy and sample test cases  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Quality Assurance Plan
- **Primary Source:** Requirements Specification
- **Related Documents:** [Functional Requirements](12-functional-requirements-checklist.md), [Business Rules](10-business-rules.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Testing Strategy
To ensure the Faith Laundry Shop Management System is reliable and bug-free, a multi-tiered testing strategy is employed:

- **Unit Testing:** Tests individual functions, classes, and services in isolation (e.g., ensuring the load calculation logic correctly computes 9kg as 2 loads).
- **Integration Testing:** Tests how different parts of the system work together (e.g., verifying that creating a new order successfully saves to the PostgreSQL database and triggers an audit log entry).
- **User Acceptance Testing (UAT):** The final phase where the end-users (Admin and Staff) test the system in a real-world scenario to ensure it meets their business needs.

## 2. Sample Test Cases

### TC-01: User Authentication
- **Objective:** Verify that only authorized staff can access the system.
- **Steps:**
  1. Navigate to the Login page.
  2. Enter a valid username and password.
  3. Click "Sign In."
- **Expected Result:** System authenticates the user and redirects to the Dashboard (Overview) page. A JWT token is stored in the session.

### TC-02: Order Creation (Standard Load)
- **Objective:** Verify that an order within the 8kg limit computes as 1 load at the correct rate.
- **Steps:**
  1. Login as Staff.
  2. Navigate to "New Order."
  3. Select or create a customer.
  4. Choose "Standard Wash" service and set weight to 7kg.
  5. Submit the order.
- **Expected Result:** System registers 1 load and sets the base amount to ₱140.00. The order status is set to RECEIVED and a reference number in the format LDR-YYYYMMDD-XXXX is generated.

### TC-03: Order Creation (Excess Load)
- **Objective:** Verify that an order exceeding 8kg computes additional loads correctly.
- **Steps:**
  1. Login as Staff.
  2. Navigate to "New Order."
  3. Select or create a customer.
  4. Choose "Standard Wash" service and set weight to 9kg.
  5. Submit the order.
- **Expected Result:** System registers 2 loads and sets the base amount to ₱280.00 (2 loads × ₱140.00/load).

### TC-04: Order Status Advancement
- **Objective:** Verify that orders can be advanced through the pipeline in the correct sequence.
- **Steps:**
  1. Login as Staff.
  2. Navigate to the Dashboard.
  3. Locate a RECEIVED order in the pipeline.
  4. Click the advance action button on the order card.
- **Expected Result:** The order moves from RECEIVED to WASHING. The status change is recorded in the audit log with the user ID and timestamp.

### TC-05: Payment Before Release
- **Objective:** Ensure an order cannot be released without recording payment first.
- **Steps:**
  1. Locate a READY_FOR_PICKUP order with payment status UNPAID.
  2. Attempt to advance the order to RELEASED.
- **Expected Result:** The system intercepts the action and opens a payment modal requiring the staff to record the payment before the order can be released.

### TC-06: Payment Recording
- **Objective:** Verify that a payment can be recorded with the correct amount and method.
- **Steps:**
  1. Open an unpaid order that is READY_FOR_PICKUP.
  2. Click the release action, which opens the payment modal.
  3. Select "CASH" as payment method.
  4. Confirm the payment.
- **Expected Result:** Payment is recorded in the payments table. The order's payment status changes to PAID, and the order advances to RELEASED.

### TC-07: Customer Duplicate Prevention
- **Objective:** Verify that duplicate customer records cannot be created.
- **Steps:**
  1. Login as Staff.
  2. Navigate to "New Order" and create a customer with name "Juan Dela Cruz" and contact "09171234567."
  3. Attempt to create another customer with the same name and contact number.
- **Expected Result:** System prevents the duplicate entry due to the unique constraint on (last_name, first_name, contact_number) and returns an appropriate error message.

### TC-08: Admin-Only Access Control
- **Objective:** Verify that Staff users cannot access Admin-restricted modules.
- **Steps:**
  1. Login as Staff.
  2. Attempt to navigate to the Reports page.
  3. Attempt to navigate to the User Management page.
- **Expected Result:** The system either hides these navigation items from the Staff user or redirects with an unauthorized error if accessed directly via URL.

### TC-09: Audit Log Generation
- **Objective:** Verify that all order and payment changes are recorded in the audit trail.
- **Steps:**
  1. Login as Admin.
  2. Create a new order.
  3. Navigate to the Audit Logs module.
  4. Search for the newly created order's record ID.
- **Expected Result:** The audit log contains an INSERT entry for the orders table with the full order data captured in the new_data JSON field, including the user who performed the action.

### TC-10: Public Order Tracking
- **Objective:** Verify that customers can track their order using the reference number without logging in.
- **Steps:**
  1. Open the public landing page (without authentication).
  2. Enter a valid order reference number (e.g., LDR-20260517-0001) in the tracking search bar.
  3. Submit the search.
- **Expected Result:** The system displays the order's current status, service type, weight, and a timestamped status history. No sensitive internal data or pricing breakdown is exposed.
