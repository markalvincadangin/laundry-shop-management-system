# Project Scope and Limitations
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** SCOPE-001  
> **Version:** 1.0  
> **Date:** 2026-05-16  
> **Purpose:** Define the boundaries, features, and constraints of the system  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Project Scope
- **Primary Source:** Client Requirements
- **Related Documents:** [Case Study](01-case-study.md), [System Service Request](02-system-service-request.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Project Scope
The Faith Laundry Shop Management System is designed to automate and streamline the core daily operations of the laundry shop. The system will cover the following key areas:

- **Transaction Management:** Recording of customer drop-offs, weight in kilograms, calculation of total loads, and automatic computation of fees (including extra charges like extended wash time or fabric conditioner).
- **Customer Management:** Maintaining a basic database of customer names and contact numbers for transaction tracking and future SMS notifications.
- **Order Tracking:** Monitoring the status of laundry through the stages: Received, Washing, Drying, Folding, Ready for Pickup, and Released.
- **Payment Processing:** Recording payments (paid upon pickup) and issuing digital or printable receipts.
- **Reporting & Analytics:** Generating daily, weekly, and monthly sales reports for the Admin to track income and performance.

## 2. Project Limitations
To ensure a successful deployment within the allotted timeframe, the system has the following limitations:

- **No Online Payment Gateway:** The system records payments made via Cash, GCash, or Bank Transfer for bookkeeping purposes only. It does not integrate directly with external payment gateway APIs (e.g., GCash API, Maya API) to process transactions electronically.
- **No Customer Account System:** Customers do not have user accounts or login credentials. However, a public order tracking portal allows customers to check their laundry status using the order reference number without authentication.
- **No Inventory Management for Supplies:** The system will not track the volume of detergent or fabric conditioner remaining in the shop.
- **No Hardware Integration:** The system will not automatically pull data from physical weighing scales or washing machines; data must be manually entered by the staff.
