# Functional Requirements Checklist
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** FRC-001  
> **Version:** 1.0  
> **Date:** 2026-02-15  
> **Purpose:** Outline exactly what the system should do  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Functional Requirements Checklist
- **Related Documents:** [Process Matrix (PM-001)](8-process-matrix.md)
- **Confidentiality:** Internal / Academic Use

---

## Functional Requirements Checklist

**SYSTEM NAME:** Laundry Shop Management System  
**EVALUATED ON:** HIMÓTECH  

### Category: Business Process Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| **1.1** | The system shall allow staff to create a laundry order by inputting customer details, laundry weight, and service type (e.g., regular, rush, ironing, blankets). | ☑ Mandatory<br>☐ Desirable |
| **1.2** | The system shall automatically compute the total price based on the weight, service type, and any additional fees, replacing manual computation. | ☑ Mandatory<br>☐ Desirable |
| **1.3** | The system shall allow staff to update and track the exact status of a laundry order (e.g., Pending, Processing, Ready for Pickup, Released). | ☑ Mandatory<br>☐ Desirable |
| **1.4** | The system shall link the payment status (Paid, Unpaid) directly to the corresponding laundry order to prevent confusion during release. | ☑ Mandatory<br>☐ Desirable |
| **1.5** | The system shall generate a digital or printable claim stub containing the customer name, weight, total price, and expected pickup date. | ☑ Mandatory<br>☐ Desirable |

### Category: User Interface Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| **2.1** | The system shall display a dashboard providing the Admin and staff with real-time visibility of pending orders, orders ready for pickup, and daily transactions. | ☑ Mandatory<br>☐ Desirable |
| **2.2** | The system shall provide visual alerts or highlights for "Rush Orders" to prioritize processing and prevent delays. | ☑ Mandatory<br>☐ Desirable |

### Category: Data Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| **3.1** | The system shall automatically assign and store a unique order reference number for every laundry order to prevent the misidentification and mixing of clothes. | ☑ Mandatory<br>☐ Desirable |
| **3.2** | The system shall securely store a centralized database of all customer transactions, order histories, and payment records. | ☑ Mandatory<br>☐ Desirable |

### Category: Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| **4.1** | The system shall require users to authenticate with a username and password before accessing the system. | ☑ Mandatory<br>☐ Desirable |
| **4.2** | The system shall restrict the deletion or modification of completed transactions and payment records to the Admin/manager account only. | ☑ Mandatory<br>☐ Desirable |

### Category: Reporting and Analytics Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| **5.1** | The system shall automatically generate daily and monthly sales reports so the Admin can view total income without manual computation. | ☑ Mandatory<br>☐ Desirable |
| **5.2** | The system shall produce a report of historical transactions to allow the Admin to analyze business trends over time. | ☑ Mandatory<br>☐ Desirable |
