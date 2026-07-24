# Faith Laundry Shop — User Manual

> **Version:** 1.1  
> **Date:** 2026-07-24  
> **Audience:** Admin and Staff  
> **Purpose:** End-user guide for the Laundry Shop Management System

---

## 1. Getting Started

### 1.1 Logging In

1. Open the application in your web browser (e.g., `http://localhost:8080` or the shortcut provided on your counter device).
2. Enter your **username** and **password**.
3. Click **Login**.

**Roles:**
- **Admin:** Full access to reports, service rates, and all order operations.
- **Staff:** Record orders, update status, record payments. No access to income reports.

### 1.2 Home Screen

After login, you will see the main dashboard with quick links to:
- **Orders** — View and manage laundry orders
- **New Order** — Create a new order
- **Customers** — Search and add customers
- **Reports** — Daily, monthly, yearly sales and business insights (Admin only)

---

## 2. Recording a New Order (US-01, US-02)

### 2.1 Create Order

1. Click **New Order** or go to **Orders → New**.
2. **Select or create a customer:**
   - Search by name or contact number to find an existing customer.
   - Or click **Add New Customer** and enter first name, last name, and contact number.
3. **Select Service Type:**
   - **Standard Wash:** ₱140/load (8kg).
   - **Rush Wash:** ₱160/load (8kg). Priority processing.
   - **Blankets:** ₱200/load (8kg). Specialized care.
4. **Enter laundry weight (kg):** Required. Must be greater than 0.
5. **Extra minutes (optional):** If the customer used more washing time than included, enter the extra minutes. 
6. **Add-ons (optional):** Add items like fabric conditioner.
7. Click **Create & Print Order**.

The system will:
- Compute total loads: `ceil(weight ÷ 8 kg)`
- Apply pricing based on selected **Service Type**.
- Generate a unique tracking number (`tracking_number`).
- **Open the Claim Stub Modal:** From here you can print the thermal receipt or download a digital copy for the customer.

### 2.2 Give Tracking Number to Customer

Share the **tracking number** with the customer so they can track their order at the **Track Order** page (no login required).

---

## 3. Updating Order Status (US-03, US-05)

### 3.1 Status Flow

Orders move through these stages:
**Received** → **Washing** → **Drying** → **Folding** → **Ready for Pickup** → **Released**

An order can be **Cancelled** from any stage before release.

### 3.2 Rush Order Alerts

Orders designated as **Rush** will display a pulsing red badge in the Dashboard and Order Queue. These should be prioritized by staff to ensure fast turnaround.

### 3.3 How to Update Status

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

## 5. Customer Order Tracking (US-04)

Customers can track their order without logging in:

1. Go to the **Track Order** page (public link, e.g., `https://track.faithlaundry.com` or `/track`).
2. Enter the tracking number (e.g., LDR-20260724-1234).
3. View current status, weight, loads, and live updates.

---

## 6. Business Insights & Reports (US-08, US-09) — Admin Only

Admin users have access to **Business Insights & Reports** (`/reports`):
- **Daily Sales Summary:** Total revenue, order count, and payment method breakdown (Cash, GCash, Bank Transfer).
- **Monthly & Yearly Income Reports:** Aggregated revenue by month and year.
- **Date Filtering:** Select custom date ranges.
- **Detailed Sales Table:** View individual paid transactions.

---

## 7. Troubleshooting & FAQs

| Issue | Solution |
| :--- | :--- |
| **Tracking number not found** | Ask customer to double-check the tracking number. Ensure no extra spaces. |
| **Cannot log in** | Check username and password. Contact Admin if locked out. |
| **Order total seems wrong** | Verify weight and extra minutes. Base: ₱140 per 8 kg load. Extra: ₱1 per minute. |
| **Cannot release order** | Order must be **Ready for Pickup** before release. Update status first. |
| **Payment already exists** | Each order has one payment only. Check if payment was already recorded. |
| **Page not loading** | Check internet/network connection. Ensure the application URL is correct. |

---

## 8. Quick Reference — Pricing (BR-PR-01 to BR-PR-04)

| Item | Rule |
|------|------|
| Base load | ₱140 per load, up to 8 kg |
| Total loads | `ceil(weight_kg ÷ 8)` |
| Extra minutes | ₱1 per minute (beyond 45 min per load) |
| Add-ons | Per-item price × quantity |

**Example:** 16.5 kg = 3 loads → Base ₱420. 10 extra minutes → ₱10. Total ₱430 (+ add-ons if any).

---

## 9. Support

For technical issues or training, contact **HIMÓTECH** or your system administrator.
