# Functional Requirements Matrix
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** FRM-001  
> **Version:** 1.0  
> **Date:** 2026-02-15  
> **Purpose:** Map required system functions sequentially  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Functional Requirements Matrix
- **Related Documents:** [Functional Requirements Checklist (FRC-001)](9-functional-requirements-checklist.md)
- **Confidentiality:** Internal / Academic Use

---

## Process: Laundry Shop Management

| Process ID | Must? | The System Must or Should |
|------------|-------|---------------------------|
| **1** | ✔ | Allow the user to create a new laundry order by inputting the customer's name, laundry weight, and specific service type (e.g., regular, rush, blankets). |
| **2** | ✔ | Automatically compute the total transaction price based on the recorded weight, selected service type, and any additional fees, eliminating manual calculation. |
| **3** | ✔ | Allow users to update and track the real-time status of each laundry order (e.g., Pending, Processing, Ready for Pickup, Released). |
| **4** | ✔ | Link payment records directly to the specific laundry order to clearly indicate whether an order is "Paid" or "Unpaid" before staff release the items to the customer. |
| **5** | ✔ | Reproduce (display and print) a transaction claim stub containing the customer's name, order weight, total price, and expected pickup date. |
| **6** | ✔ | Reproduce (display and print) a dashboard or list showing all current orders, specifically filtering those that are pending, processing, or ready for pickup. |
| **7** | ✔ | Highlight or provide visual alerts for "Rush Orders" to help staff prioritize processing and prevent delays. |
| **8** | ✔ | Reproduce (display and print) daily and monthly sales reports summarizing total income and the number of transactions processed. |
| **9** | ✔ | Automatically assign a unique transaction ID to every laundry order to prevent the mixing or misidentification of customers' clothes. |
| **10** | ✔ | Restrict the ability to modify or delete completed transactions and payment records to the Admin/manager account only. |
