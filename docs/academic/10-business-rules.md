# Business Rules
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** BR-001  
> **Version:** 1.1  
> **Date:** 2026-05-17  
> **Purpose:** Define the core business logic, computational rules, and system constraints  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Business Rules
- **Primary Source:** Client Interview & Observation
- **Related Documents:** [Process Matrix](09-process-matrix.md), [Functional Requirements](12-functional-requirements-checklist.md), [User Stories](11-user-stories-and-use-cases.md)
- **Confidentiality:** Internal / Academic Use

---

This document outlines the core business logic and computational rules that the Faith Laundry Shop Management System must enforce. Each rule is categorized by domain and assigned a unique identifier for traceability to the functional requirements and test cases.

## 1. Pricing and Load Rules (BR-PR)

- **BR-PR-01 (Base Load Pricing):** One (1) standard load is defined as a maximum of eight (8) kilograms. The base price for one (1) standard load of "Standard Wash" is **₱140.00**.
- **BR-PR-02 (Additional Load for Excess Weight):** If a customer's laundry exceeds the per-load weight limit (8 kg for Standard Wash), the total number of loads is computed as `ceil(weight_kg / kg_limit_per_load)`. Each additional load is charged at the same base price per load (e.g., 9 kg = 2 loads = ₱280.00).
- **BR-PR-03 (Extra Washing Time Charge):** Washing time beyond the included 45 minutes per load is charged at **₱1.00 per extra minute**. If no extra minutes are recorded, this charge is zero.
- **BR-PR-04 (Optional Add-ons):** Additional requests (e.g., fabric conditioner) must add standard predefined amounts to the total bill. Add-on pricing is itemized as separate line items on the order.
- **BR-PR-05 (Admin Controls Service Rates):** The Admin must be able to update service rates (base price per load, kg limit per load, price per extra minute) without code changes. Rate changes apply only to new orders; existing orders retain the snapshot pricing captured at creation time.

## 2. Order Lifecycle Rules (BR-OL)

- **BR-OL-01 (Unique Reference Number):** Every order must have a unique reference number in the format `LDR-XXXXXXXX-XXXX` used for tracking and customer claim stubs. The system generates this automatically upon order creation.
- **BR-OL-02 (Initial Order Status):** A newly created order must start with status **RECEIVED**. No other initial status is allowed.
- **BR-OL-03 (Allowed Order Statuses):** Order status must be one of the following: `RECEIVED`, `WASHING`, `DRYING`, `FOLDING`, `READY_FOR_PICKUP`, `RELEASED`, or `CANCELLED`.
- **BR-OL-04 (Status Transition Sequence):** Orders should follow a logical sequence of stages: `RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED`. Any non-terminal status may transition to `CANCELLED`. The `CANCELLED` and `RELEASED` statuses are terminal — no further transitions are allowed.
- **BR-OL-05 (Release Preconditions):** An order can only be released (status changed to `RELEASED`) if two conditions are met: (1) the current status is `READY_FOR_PICKUP`, and (2) the payment status is `PAID`. The system must reject release attempts for unpaid orders.
- **BR-OL-06 (Order Edit Restrictions):** Staff or Admin may edit an order's extra minutes and add-ons only when the order is unpaid and not released. Weight, base amount, and total loads are immutable after creation.

## 3. Payment Rules (BR-PAY)

- **BR-PAY-01 (Payment Timing):** Payment is typically collected upon pickup, not at drop-off. This is a process guideline, not a strict system constraint.
- **BR-PAY-02 (Payment Linked to Order):** Each payment must be associated with exactly one order. This is enforced by a database foreign key constraint.
- **BR-PAY-03 (Payment Amount Validation):** The recorded payment amount must exactly match the order grand total. Partial payments, overpayments, and refunds are not supported in the current version.
- **BR-PAY-04 (Payment Status):** An order's payment status is either `PAID`, `UNPAID`, or `VOIDED`. The status is derived from the presence of a completed payment record, and transitions to `VOIDED` upon paid order cancellation.
- **BR-PAY-05 (Payment Method):** Each payment must record the payment method used: **Cash**, **GCash**, or **Bank Transfer**. This is for record-keeping only; the system does not integrate with external payment gateways.
- **BR-PAY-06 (Automatic Reversal on Cancellation):** When a paid order is cancelled, the associated payment status must automatically transition to `VOIDED` to ensure financial reports accurately reflect net revenue.

## 4. Records and Retention Rules (BR-REC)

- **BR-REC-01 (Core Data Requirements):** The system must store, at minimum: customer name and contact number, complete laundry order details (service type, weight, loads, pricing breakdown), payment records, and all data necessary to derive daily sales totals.

## 5. Notification Rules (BR-NOTIF)

- **BR-NOTIF-01 (Customer Ready Notification):** The system should generate a notification (via SMS through Semaphore.co) when the order status changes to `READY_FOR_PICKUP`. This notification includes the order reference number.
- **BR-NOTIF-02 (Tracking by Reference Number):** Customers must be able to track their laundry status using the order reference number through a public tracking portal. No sensitive or internal data shall be exposed through this portal.
