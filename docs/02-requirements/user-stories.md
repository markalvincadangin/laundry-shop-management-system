# User Stories
## Laundry Shop Management System

> **Source:** Client Interview & Case Study (Faith Laundry Shop)  
> **Purpose:** Define functional behavior for implementation  
> **Status:** Baseline (MVP)

---

## Epic 1: Order Intake & Management

### US-01 – Record Laundry Order
**As a** staff or owner  
**I want** to record a laundry order with customer and laundry details  
**So that** the system can track the order from drop-off to pickup.

**Acceptance Criteria**
- Customer name is required
- Customer contact number is required
- Laundry weight (kg) is required
- Order date is automatically recorded
- System generates a unique order reference number
- Initial order status is set to **Received**

---

### US-02 – Automatically Compute Laundry Price
**As a** staff or owner  
**I want** the system to compute the laundry price automatically  
**So that** pricing errors and manual calculations are avoided.

**Acceptance Criteria**
- One (1) load costs **₱120**
- One load covers up to **8 kg**
- Laundry exceeding 8 kg is charged as an additional load
- Extra washing time is charged at **₱1 per minute**
- Computed total amount is displayed before saving the order

---

### US-03 – Update Laundry Order Status
**As a** staff or owner  
**I want** to update the laundry order status  
**So that** the current processing stage is accurately reflected.

**Acceptance Criteria**
- Allowed order statuses include:
    - Received
    - Washing
    - Drying
    - Folding
    - Ready for Pickup
    - Released
- Status changes are recorded with a timestamp
- Only existing orders can have their status updated

---

## Epic 2: Order Tracking & Release

### US-04 – Track Laundry Order by Reference Number
**As a** customer  
**I want** to track my laundry order using a reference number  
**So that** I can check the status without asking the staff.

**Acceptance Criteria**
- Customer can enter an order reference number
- System displays the current order status
- System displays order date and service summary
- Invalid reference numbers show a clear error message

---

### US-05 – Verify Laundry Before Release
**As a** staff or owner  
**I want** to verify laundry details before releasing the order  
**So that** incorrect items are not given to customers.

**Acceptance Criteria**
- Staff can view order and customer details
- Order must be marked **Ready for Pickup** before release
- Order status is updated to **Released** after verification

---

## Epic 3: Payments & Transactions

### US-06 – Record Payment for Laundry Order
**As a** staff or owner  
**I want** to record customer payments  
**So that** payment history is properly tracked.

**Acceptance Criteria**
- Payment is linked to exactly one order
- Payment amount must match the computed total
- Payment date is automatically recorded
- Order payment status is updated (Paid / Unpaid)

---

### US-07 – View Payment History
**As the** owner  
**I want** to view payment records  
**So that** I can review transaction history.

**Acceptance Criteria**
- Payments can be filtered by date range
- Each payment shows order reference number and amount
- Only the owner can access full payment history

---

## Epic 4: Records & Reporting

### US-08 – View Daily Sales Report
**As the** owner  
**I want** to view daily sales automatically  
**So that** I do not need to compute income manually.

**Acceptance Criteria**
- System shows total daily income
- Number of completed orders is displayed
- Data is based on recorded payments only

---

### US-09 – View Monthly and Yearly Income Reports
**As the** owner  
**I want** to view monthly and yearly income reports  
**So that** I can monitor business performance over time.

**Acceptance Criteria**
- Reports can be filtered by month and year
- Total income is computed automatically
- Only completed and paid orders are included

---

## Epic 5: Customer Communication

### US-10 – Notify Customer When Laundry Is Ready
**As a** customer  
**I want** to receive a notification when my laundry is ready  
**So that** I know when to pick it up.

**Acceptance Criteria**
- Notification is triggered when status becomes **Ready for Pickup**
- Notification includes order reference number
- Notification channel may be SMS or digital message

---

## Epic 6: User Access & Control

### US-11 – User Login and Role-Based Access
**As a** system user  
**I want** to log in based on my role  
**So that** I can access appropriate system features.

**Acceptance Criteria**
- User roles include **Owner** and **Staff**
- Owner has access to reports and records
- Staff can manage orders and payments but not income reports

---

## MVP Scope (Initial Implementation)
The following user stories are required for the MVP:

- US-01 Record Laundry Order
- US-02 Automatically Compute Laundry Price
- US-03 Update Laundry Order Status
- US-04 Track Laundry Order
- US-06 Record Payment
- US-08 View Daily Sales Report
