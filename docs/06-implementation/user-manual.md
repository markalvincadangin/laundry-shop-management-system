# Faith Laundry Shop — User Manual

> **Version:** 1.0  
> **Date:** 2026-02-17  
> **Audience:** Owner and Staff  
> **Purpose:** End-user guide for the Laundry Shop Management System

---

## 1. Getting Started

### 1.1 Logging In

1. Open the application in your web browser (e.g., `http://laundry.local` or the URL provided by your administrator).
2. Enter your **username** and **password**.
3. Click **Login**.

**Roles:**
- **Owner:** Full access to reports, service rates, and all order operations.
- **Staff:** Record orders, update status, record payments. No access to income reports.

### 1.2 Home Screen

After login, you will see the main dashboard with quick links to:
- **Orders** — View and manage laundry orders
- **New Order** — Create a new order
- **Customers** — Search and add customers
- **Reports** — Daily, monthly, yearly sales (Owner only)

---

## 2. Recording a New Order (US-01, US-02)

### 2.1 Create Order

1. Click **New Order** or go to **Orders → New**.
2. **Select or create a customer:**
   - Search by name or contact number to find an existing customer.
   - Or click **Add New Customer** and enter first name, last name, and contact number.
3. **Enter laundry weight (kg):** Required. Must be greater than 0.
4. **Extra minutes (optional):** If the customer used more washing time than included (45 min per load), enter the extra minutes. Charged at ₱1 per minute.
5. **Add-ons (optional):** Add items like fabric conditioner with name, price, and quantity.
6. Click **Create Order**.

The system will:
- Compute total loads: `ceil(weight ÷ 8 kg)`
- Compute base amount: loads × ₱120
- Compute extra minutes charge: extra minutes × ₱1
- Add add-on totals
- Generate a unique reference number (e.g., LDR-20260217-1234)
- Set initial status to **Received**

### 2.2 Give Reference Number to Customer

Share the **reference number** with the customer so they can track their order at the **Track Order** page (no login required).

---

## 3. Updating Order Status (US-03, US-05)

### 3.1 Status Flow

Orders move through these stages:
**Received** → **Washing** → **Drying** → **Folding** → **Ready for Pickup** → **Released**

An order can be **Cancelled** from any stage before release.

### 3.2 How to Update Status

1. Go to **Orders** and click the order.
2. Click **Update Status**.
3. Select the new status.
4. Add optional notes (e.g., "Customer called to confirm pickup").
5. Click **Save**.

**Important:** An order can only be **Released** when (1) its status is **Ready for Pickup** and (2) payment has been recorded. Verify the laundry and collect payment before releasing.

---

## 4. Recording Payment (US-06)

### 4.1 When to Record Payment

Payments are typically collected when the customer picks up the laundry.

### 4.2 How to Record Payment

1. Open the order (status should be **Ready for Pickup** or **Released**).
2. Click **Record Payment**.
3. The amount is pre-filled to match the order total (must match exactly).
4. Select **Payment Method:** Cash, GCash, or Bank Transfer.
5. Add optional remarks.
6. Click **Record Payment**.

**Note:** Each order can have only one payment. If payment was already recorded, you will see an error.

---

## 5. Viewing Reports (US-08, US-09) — Owner Only

### 5.1 Daily Report

1. Go to **Reports → Daily**.
2. Select the date.
3. View **Total Income** and **Orders Completed** for that day.

### 5.2 Monthly Report

1. Go to **Reports → Monthly**.
2. Select year and month.
3. View total income and order count.

### 5.3 Yearly Report

1. Go to **Reports → Yearly**.
2. Select the year.
3. View annual totals.

---

## 6. Customer Order Tracking (US-04)

Customers can track their order without logging in:

1. Go to the **Track Order** page (public link, e.g., `/track`).
2. Enter the reference number (e.g., LDR-20260217-1234).
3. Click **Track**.
4. View current status, order date, and total.

---

## 7. Managing Service Rates — Owner Only

The default pricing is ₱120 per load (8 kg), ₱1 per extra minute. The Owner can update these in **Service Rates** if business rules change.

---

## 8. Troubleshooting

| Problem | Solution |
|--------|----------|
| **Cannot log in** | Check username and password. Contact Owner if locked out. |
| **Order total seems wrong** | Verify weight and extra minutes. Base: ₱120 per 8 kg load. Extra: ₱1 per minute. |
| **Cannot release order** | Order must be **Ready for Pickup** before release. Update status first. |
| **Payment already exists** | Each order has one payment only. Check if payment was already recorded. |
| **Page not loading** | Check internet/network. Ensure the application URL is correct. |
| **Reference number not found** | Ask customer to double-check the reference. Ensure no extra spaces. |

---

## 9. Quick Reference — Pricing (BR-PR-01 to BR-PR-04)

| Item | Rule |
|------|------|
| Base load | ₱120 per load, up to 8 kg |
| Total loads | `ceil(weight_kg ÷ 8)` |
| Extra minutes | ₱1 per minute (beyond 45 min per load) |
| Add-ons | Per-item price × quantity |

**Example:** 16.5 kg = 3 loads → Base ₱360. 10 extra minutes → ₱10. Total ₱370 (+ add-ons if any).

---

## 10. Support

For technical issues or training, contact **HIMÓTECH** or your system administrator.
