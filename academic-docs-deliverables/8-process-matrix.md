# Process Matrix

## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** PM-001  
> **Version:** 1.0  
> **Date:** 2026-02-14  
> **Purpose:** Document current (As-Is) and proposed (To-Be) business processes  
> **Status:** Baseline

---

## Document Control

- **Document Type:** Process Matrix
- **Related Documents:** [To-Be Process Flow](../03-process/to-be-flow.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Purpose of the Process Matrix

This Process Matrix documents the current (As-Is) and proposed (To-Be) business processes of Faith Laundry Shop. It identifies manual activities, inefficiencies, and error-prone steps and defines how the proposed Laundry Shop Management System will support existing business practices without altering the core service model. This matrix serves as the primary basis for functional requirements, system modeling, and design.

## 2. Process Matrix


| Process ID | Business Process                 | Primary Actor(s) | Inputs                                              | Process Description (As-Is)                                                                                                                             | Outputs                  | System Support (To-Be)                                                                                                       |
| ---------- | -------------------------------- | ---------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **P-01**   | Receive Laundry Order            | Admin / Staff    | - Customer laundry - Customer name - Contact number | Receive laundry from customer. Weigh laundry in kilograms. Sort items based on customer preferences (e.g., white vs colored).                           | Accepted laundry order   | Record customer and order details digitally. Generate unique order reference number. Set initial order status to *Received*. |
| **P-02**   | Compute Laundry Charges          | Admin / Staff    | - Laundry weight - Current pricing rules            | Compute charges manually on a per-load basis. One load covers up to 8 kg at standard rate. Add extra charges for extended washing time when applicable. | Total amount due         | Automatically compute charges based on configurable pricing rules. Allow adjustments for special cases.                      |
| **P-03**   | Issue Receipt / Claim Stub       | Admin / Staff    | - Order details - Computed charges                  | Write receipt manually. Provide customer with handwritten claim stub.                                                                                   | Receipt / claim stub     | Generate system-based receipt. Display order reference number clearly. Store transaction details.                            |
| **P-04**   | Process Laundry                  | Staff            | Laundry order                                       | Wash, dry, fold, and iron laundry items. Place completed laundry in labeled bags.                                                                       | Processed laundry        | Update order status to *In Process* and *Ready for Pickup*.                                                                  |
| **P-05**   | Track Laundry Status             | Admin / Staff    | - Logbook - Physical tags                           | Check logbook or physical tags. Rely on memory to identify order progress.                                                                              | Order status information | View real-time order status using order reference number.                                                                    |
| **P-06**   | Record Payment                   | Admin / Staff    | Customer payment                                    | Accept payment, typically upon pickup. Record payment manually in notebook.                                                                             | Payment record           | Record payment digitally. Link payment to corresponding order.                                                               |
| **P-07**   | Release Laundry                  | Staff            | - Claim stub - Completed laundry                    | Verify customer claim stub. Check laundry condition and quantity. Release laundry to customer.                                                          | Released laundry         | Validate order using order reference number. Update order status to *Released*.                                                    |
| **P-08**   | Maintain Records                 | Admin            | Paper-based records                                 | Store receipts and notebooks. Archive records after approx. one month.                                                                                  | Archived records         | Maintain centralized digital records with extended retention.                                                                |
| **P-09**   | Generate Reports                 | Admin            | Transaction records                                 | Manually compute income totals.                                                                                                                         | Daily/Monthly income     | Generate automated daily, monthly, and yearly sales reports.                                                                 |
| **P-10**   | Provide Order Status Information | Admin / Staff    | Order reference number                              | Respond to customer inquiries verbally.                                                                                                                 | Customer updates         | Allow staff and customers to check order status using the order reference number.                                            |


