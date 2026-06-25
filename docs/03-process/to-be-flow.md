# To-Be Process Flow
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** PROC-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Define future-state operational process flows after system implementation  
> **Status:** Baseline (MVP Reference)

---

## Document Control
- **Document Type:** Process Modeling (To-Be State)
- **Related Documents:** [Project Scope](../01-scope/project-scope.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Architecture](../05-tech-design/architecture.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Introduction

This document defines the To-Be operational process flow of the Faith Laundry Shop after system implementation.

It describes:
- How the business will operate using the digital system
- Order lifecycle
- Payment validation flow
- Reporting flow
- Customer tracking flow

This document serves as the reference for backend service design and frontend screen sequencing.

---

## 2. Process Overview

The system replaces manual logbook and tag-based processes with a structured digital workflow.

### 2.1 High-Level Process Flow

```
Customer Drop-Off
      ↓
Order Intake (Staff or Admin)
      ↓
Automatic Price Computation
      ↓
Order Processing (Status Updates)
      ↓
Ready for Pickup
      ↓
Payment Recording
      ↓
Order Release
      ↓
Reporting
```

---

## 3. Detailed Process Flows

### 3.1 Order Intake Process

**Actor:** Staff or Admin  
**Trigger:** Customer brings laundry to the shop.

**Related Requirements**
- **User Stories:** [US-01](../02-requirements/user-stories.md#us-01-record-laundry-order), [US-02](../02-requirements/user-stories.md#us-02-automatically-compute-laundry-price)
- **Business Rules:** [BR-PR-01](../02-requirements/business-rules.md#br-pr-01-base-load-pricing), [BR-PR-02](../02-requirements/business-rules.md#br-pr-02-additional-load-for-excess-weight), [BR-PR-03](../02-requirements/business-rules.md#br-pr-03-extra-washing-time-charge), [BR-PR-04](../02-requirements/business-rules.md#br-pr-04-optional-add-ons-eg-fabric-conditioner), [BR-OL-01](../02-requirements/business-rules.md#br-ol-01-order-must-have-a-unique-reference-number), [BR-OL-02](../02-requirements/business-rules.md#br-ol-02-initial-order-status)

**Steps**
1. Staff or Admin enters customer details: first name, last name, contact number.
2. Staff or Admin records: laundry weight (kg), extra minutes (if any), optional add-ons.
3. System automatically:
   - Calculates total loads (8 kg per load)
   - Computes base amount (₱140 per load)
   - Computes extra minute charge (₱1 per minute beyond 45 minutes per load)
   - Computes add-ons total and grand total
   - Generates unique reference number
   - Sets order status to **Received**
   - Stores timestamp
4. Order record is saved.

**Rules/Constraints**
- Weight is required; reject if missing or invalid (BR-PR-01).
- Total loads = `ceil(weight_kg / 8)` (BR-PR-02).
- Reference number MUST be unique (BR-OL-01).
- Initial status MUST be Received (BR-OL-02).

**Output**
- Order reference number issued
- Grand total displayed

---

### 3.2 Order Processing Lifecycle

**Actor:** Staff or Admin  
**Trigger:** Order requires status update as laundry moves through processing stages.

**Related Requirements**
- **User Stories:** [US-03](../02-requirements/user-stories.md#us-03-update-laundry-order-status), [US-05](../02-requirements/user-stories.md#us-05-verify-laundry-before-release)
- **Business Rules:** [BR-OL-03](../02-requirements/business-rules.md#br-ol-03-allowed-order-status-values), [BR-OL-04](../02-requirements/business-rules.md#br-ol-04-status-transition-control-recommended), [BR-OL-05](../02-requirements/business-rules.md#br-ol-05-release-preconditions)

**Valid Status Flow (Normal Sequence)**

```
RECEIVED
   ↓
WASHING
   ↓
DRYING
   ↓
FOLDING
   ↓
READY_FOR_PICKUP
   ↓
RELEASED
```

**Additional Status**
- **CANCELLED:** Terminal state; can be set from any non-terminal status.

**Rules/Constraints**
- Status MUST belong to the predefined set (BR-OL-03).
- Status transitions SHOULD follow the logical sequence (BR-OL-04, recommended for MVP+).
- Order cannot move to RELEASED unless (1) status is READY_FOR_PICKUP and (2) payment has been recorded (Paid) (BR-OL-05).
- Every status change is logged with the timestamp and user.

---

### 3.3 Payment Process

**Actor:** Staff or Admin  
**Trigger:** Customer arrives for pickup.

**Related Requirements**
- **User Stories:** [US-06](../02-requirements/user-stories.md#us-06-record-payment-for-laundry-order)
- **Business Rules:** [BR-PAY-01](../02-requirements/business-rules.md#br-pay-01-payment-timing), [BR-PAY-02](../02-requirements/business-rules.md#br-pay-02-payment-must-be-linked-to-an-order), [BR-PAY-03](../02-requirements/business-rules.md#br-pay-03-payment-amount-validation), [BR-PAY-04](../02-requirements/business-rules.md#br-pay-04-payment-status)

**Steps**
1. Staff or Admin retrieves an order using a reference number or customer search.
2. System displays order details, computed grand total, and current payment status.
3. Staff or Admin enters the payment amount and selects payment method (Cash, GCash, Bank Transfer).
4. System validates:
   - Payment amount equals order grand total (BR-PAY-03)
   - No existing payment for the order (one payment per order, BR-PAY-02)
5. If valid:
   - Payment record is stored (including payment method, BR-PAY-05)
   - Payment status updated to **Paid**
   - Order eligible for release
6. Staff or Admin updates order status to **Released** (order MUST be Ready for Pickup and Paid first; BR-OL-05).

**Rules/Constraints**
- Payment is typically collected upon pickup (BR-PAY-01).
- One payment per order (BR-PAY-02).
- The payment amount MUST exactly match the order grand total (BR-PAY-03).
- Payment status MUST be Paid or Unpaid (BR-PAY-04).

**Output**
- Payment record stored
- Order marked completed (status Released)

---

### 3.4 Customer Order Tracking Process

**Actor:** Customer  
**Trigger:** Customer wants to check order status.

**Related Requirements**
- **User Stories:** [US-04](../02-requirements/user-stories.md#us-04-track-laundry-order-by-reference-number)
- **Business Rules:** [BR-NOTIF-02](../02-requirements/business-rules.md#br-notif-02-tracking-by-reference-number), [BR-OL-01](../02-requirements/business-rules.md#br-ol-01-order-must-have-a-unique-reference-number)

**Steps**
1. Customer enters reference number.
2. System validates reference exists.
3. System displays: current status, order date, basic order summary.

**Rules/Constraints**
- No pricing breakdown exposed.
- No payment details are exposed.
- No internal notes are exposed.

**Output**
- Order status and basic summary are displayed to the customer

---

### 3.5 Reporting Process

**Actor:** Admin  
**Trigger:** Admin requests an income report.

**Related Requirements**
- **User Stories:** [US-08](../02-requirements/user-stories.md#us-08-view-daily-sales-report), [US-09](../02-requirements/user-stories.md#us-09-view-monthly-and-yearly-income-reports)
- **Business Rules:** [BR-REC-01](../02-requirements/business-rules.md#br-rec-01-core-data-to-record), [BR-PAY-04](../02-requirements/business-rules.md#br-pay-04-payment-status)

**Steps**
1. Admin selects the report type: Daily, Monthly, or Yearly.
2. System aggregates completed payments within the selected period.
3. System generates total revenue and transaction count.

**Rules/Constraints**
- Reports are computed exclusively from recorded payment data.
- Only orders with payment status **Paid** are included.
- Unpaid or cancelled orders are excluded.

**Output**
- Total revenue
- Transaction count

---

## 4. Exception Handling

### 4.1 Invalid Status Update

**Condition:** Staff or Admin attempts an invalid status value or invalid transition.

**System Behavior**
- Reject change
- Display validation message

**Reference:** [BR-OL-03](../02-requirements/business-rules.md#br-ol-03-allowed-order-status-values)

---

### 4.2 Incorrect Payment Amount

**Condition:** Entered payment amount is less than or greater than the order grand total.

**System Behavior**
- Reject payment
- Display error message
- Do not update payment status

**Reference:** [BR-PAY-03](../02-requirements/business-rules.md#br-pay-03-payment-amount-validation)

---

## 5. Process Improvements Over Current System

| Current Manual Process   | Proposed System             |
|--------------------------|-----------------------------|
| Manual price computation | Automated computation       |
| Paper-based tracking     | Digital status tracking     |
| Limited historical data  | Persistent database storage |
| Manual sales tallying    | Automated reporting         |
| Tag-based tracking       | Reference number tracking   |

---

## 6. Alignment with System Architecture

The To-Be process flow aligns with:
- Service Layer enforcing all business rules
- Repository Layer handling persistence
- Controller Layer exposing validated APIs
- Frontend serving as presentation only

Business rules remain centralized in backend services.

---

## 7. Conclusion

This document formalizes how Faith Laundry Shop operations will transition from manual record-keeping to a structured, digital, rule-enforced system. It ensures clear lifecycle control, accurate pricing computation, validated payments, and structured reporting.
