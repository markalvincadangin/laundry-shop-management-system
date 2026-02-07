# Business Rules Catalog
## Laundry Shop Management System

> **Source:** Client Interview & Case Study (Faith Laundry Shop)  
> **Purpose:** Define enforceable rules that drive backend logic, validation, and computations  
> **Status:** Baseline (MVP)

---

## 1. Pricing Rules

### BR-PR-01 – Base Load Pricing
**Rule:** One (1) laundry load costs **₱120** and covers up to **8 kg**.  
**Applies To:** Order creation / price computation  
**Enforcement:** Backend service (server-side)  
**Error/Handling:** If weight is missing/invalid, reject order.

---

### BR-PR-02 – Additional Load for Excess Weight
**Rule:** If the laundry weight exceeds **8 kg**, the excess must be charged as an additional load.  
**Applies To:** Order creation / price computation  
**Enforcement:** Backend service  
**Notes:** The total number of loads must be derived from weight (e.g., weight ÷ 8kg, rounded up).

---

### BR-PR-03 – Extra Washing Time Charge
**Rule:** When laundry requires washing time beyond the **included 45 minutes per load** (e.g., due to excessive dirt), an additional charge of **₱1 per extra minute** of machine use is added.  
**Applies To:** Order creation / price computation (when extra minutes are recorded)  
**Enforcement:** Backend service  
**Notes:** The base price (see BR-PR-01 / US-02) includes up to 45 minutes of washing time per load. Extra minutes are only those beyond 45 minutes; this field is optional, and if not provided, the extra-minutes charge is 0.

---

### BR-PR-04 – Optional Add-ons (e.g., Fabric Conditioner)
**Rule:** Additional charges may be applied when the customer requests extra fabric conditioner.  
**Applies To:** Order creation / add-on handling  
**Enforcement:** Backend service  
**Notes:** The exact add-on pricing is not fixed in the interview; implement as configurable or record as a manual add-on amount.

---

## 2. Order Lifecycle Rules

### BR-OL-01 – Order Must Have a Unique Reference Number
**Rule:** Every order must have a unique **order reference number** used for tracking.  
**Applies To:** Order creation, tracking portal  
**Enforcement:** Backend service + database unique constraint  
**Error/Handling:** Reject creation if reference already exists (or regenerate).

---

### BR-OL-02 – Initial Order Status
**Rule:** A newly created order must start with status **Received**.  
**Applies To:** Order creation  
**Enforcement:** Backend service

---

### BR-OL-03 – Allowed Order Status Values
**Rule:** Order status must be one of the defined states:
- Received
- Washing
- Drying
- Folding
- Ready for Pickup
- Released

**Applies To:** Status updates  
**Enforcement:** Backend service validation  
**Error/Handling:** Reject invalid status values.

---

### BR-OL-04 – Status Transition Control (Recommended)
**Rule:** Orders should follow a logical sequence of stages (no skipping backwards unless corrected by staff/owner).  
**Applies To:** Status updates  
**Enforcement:** Backend service (recommended for MVP+)

**Suggested Allowed Transitions**
- Received → Washing
- Washing → Drying
- Drying → Folding
- Folding → Ready for Pickup
- Ready for Pickup → Released

---

### BR-OL-05 – Release Preconditions
**Rule:** An order can only be released if its status is **Ready for Pickup**.  
**Applies To:** Release action  
**Enforcement:** Backend service  
**Error/Handling:** Reject release if not ready.

---

## 3. Payment Rules

### BR-PAY-01 – Payment Timing
**Rule:** Payment is typically collected **upon pickup** (not drop-off).  
**Applies To:** Payment recording workflow  
**Enforcement:** Process rule (UI/flow), not a strict validation rule

---

### BR-PAY-02 – Payment Must Be Linked to an Order
**Rule:** Each payment record must be associated with exactly one order.  
**Applies To:** Payment creation  
**Enforcement:** Database foreign key + backend validation

---

### BR-PAY-03 – Payment Amount Validation
**Rule:** Recorded payment amount must exactly match the computed total amount for the order.  
**Applies To:** Payment creation  
**Enforcement:** Backend service  
**Error/Handling:** Reject any payment where the amount does not exactly match the order total.  
**MVP Scope:** Strict matching only; partial payments, overpayments, and owner override capabilities are post-MVP features (see US-06).

---

### BR-PAY-04 – Payment Status
**Rule:** Payment status must be recorded as **Paid** or **Unpaid** (or derived from presence of payment).  
**Applies To:** Order/payment view and reporting  
**Enforcement:** Backend service

---

## 4. Records & Retention Rules

### BR-REC-01 – Core Data to Record
**Rule:** The system must store at minimum:
- Customer name and contact number
- Laundry order details
- Payment records
- Daily sales totals (derivable from payments)

**Applies To:** Data model, forms, reporting  
**Enforcement:** Data design requirement

---

### BR-REC-02 – Retention Reference (Optional for MVP)
**Rule:** Current manual practice keeps active records for about **one (1) month** before archiving.  
**Applies To:** Records management feature  
**Enforcement:** Optional for MVP; can be implemented later as archiving/filtering.

---

## 5. Notifications & Tracking Rules

### BR-NOTIF-01 – Customer Ready Notification Trigger
**Rule:** The system should notify the customer when an order status becomes **Ready for Pickup**.  
**Applies To:** Status updates  
**Enforcement:** Backend event/trigger + notification service (MVP optional)

---

### BR-NOTIF-02 – Tracking by Reference Number
**Rule:** Customers must be able to track laundry status using the order reference number.  
**Applies To:** Tracking page/API  
**Enforcement:** Backend endpoint + lookup by unique reference

---

## MVP Enforcement Checklist
For MVP implementation, enforce at least:
- BR-PR-01, BR-PR-02, BR-PR-03
- BR-OL-01, BR-OL-02, BR-OL-03, BR-OL-05
- BR-PAY-02, BR-PAY-03, BR-PAY-04
- BR-NOTIF-02 (tracking by reference)

Recommended next:
- BR-OL-04 (status transitions)
- BR-PAY-03 owner override feature (post-MVP enhancement)
- BR-NOTIF-01 (ready notifications)
