# Case Study
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** Mark Alvin Cadangin  
> **Document ID:** CS-001  
> **Version:** 1.0  
> **Date:** 2026-02-06  
> **Purpose:** Document current operations, identify business problems, and justify system improvement  
> **Status:** Baseline (Reference)

---

## Document Control
- **Document Type:** Case Study
- **Primary Source:** Client Interview & Observation
- **Related Documents:** [Client Interview (INT-001)](client-interview.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md), [Project Scope](../01-scope/project-scope.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Introduction

This case study documents the current operational practices of Faith Laundry Shop to identify business problems and opportunities for improvement through an information system.

The study is based on a semi-structured interview and on-site observation with the Admin and staff. Findings serve as the foundation for requirements definition, system design, and implementation.

---

## 2. Business Profile

### 2.1 Business Overview

Faith Laundry Shop is a small-scale laundry service established in 2022, located in Ilaya, Tabuc Suba Jaro, Iloilo City. The business has operated for approximately three years and caters to local customers requiring regular laundry services.

Operations are managed by the Admin with one staff member. Both are directly involved in daily activities.

### 2.2 Services Offered

Faith Laundry Shop provides:
- Washing
- Drying
- Folding

Services are offered on a per-load basis, depending on the weight and condition of laundry items.

---

## 3. Current Business Environment

### 3.1 Operational Setup

Daily operations are primarily manual. When customers bring laundry, staff measures total weight in kilograms and sorts items by customer preference (e.g., separating colored and white clothing).

The laundry is washed, dried, and folded using washing machines. Completed items are placed in labeled bags with the customer's name and prepared for pickup.

Receipts or claim stubs include:
- Customer name
- Contact number
- Transaction date
- Total payment amount
- Laundry shop name
- Authorized signature

Payment is typically collected upon pickup rather than at drop-off.

### 3.2 Pricing Structure

Pricing is computed on a per-load basis:

- One (1) load costs **₱140**
- One load covers up to **8 kg**
- Laundry exceeding 8 kg is charged as an additional load

Additional charges may apply for:
- Extra fabric conditioner requests
- Extended washing time due to excessive dirt — **₱1 per extra minute** of machine use

All pricing is computed manually by staff at the time of transaction.

### 3.3 Technology Usage

The business relies on paper-based tools:
- Physical tags
- Logbooks
- Manual notebooks for payments and sales

Records are kept for approximately one month before archiving. No computerized or automated system is used for operations or reporting.

---

## 4. Problem Identification

### 4.1 Observed Problems

Based on the interview and observation:

**Manual and Time-Consuming Record Keeping** — Recording orders, payments, and sales manually requires significant effort from Admin and staff.

**Occasional Order Mix-Ups** — During peak hours or with multiple rush orders, clothes may be mixed, increasing error risk and customer dissatisfaction.

**Limited Order Tracking** — Laundry status depends on logbooks and physical inspection, leading to delays or inaccuracies.

**Lack of Automated Reporting** — Income tracking is manual; the Admin lacks automated daily, monthly, or yearly reports.

**Operational Dependency on Machinery** — Washing machine malfunctions cause stress and financial impact. Better tracking and visibility can help manage operations during downtime.

### 4.2 Root Causes

- Heavy reliance on manual processes
- Lack of system automation
- Dependence on human memory for order tracking

These factors limit efficiency, increase error likelihood, and restrict access to timely business information.

---

## 5. Business Impact

The identified problems affect operational efficiency and reliability. Manual record keeping slows service and increases inaccuracy risk. Order mix-ups can lead to customer complaints and loss of trust.

The absence of automated reporting makes it difficult for the Admin to evaluate performance, compare income across periods, and make informed decisions.

---

## 6. Opportunity for System Improvement

Findings indicate a strong opportunity to improve operations through a Laundry Shop Management System that supports:

- Digital recording of laundry orders
- Centralized transaction history
- Automated computation of laundry charges
- SMS or digital notifications for customers
- Order tracking using a unique reference number

Reliable order visibility reduces reliance on verbal inquiries and manual logbooks.

**Traceability:** These opportunities inform [User Stories](../02-requirements/user-stories.md) (US-01, US-02, US-04, US-06, US-08, US-10) and [Business Rules](../02-requirements/business-rules.md) (BR-PR-*, BR-OL-01, BR-PAY-*, BR-NOTIF-*).

---

## 7. Project Justification

Developing an information system is justified by the need to streamline operations, reduce errors, and support better decision-making.

The Admin has expressed willingness to adopt a simple computer-based system. A system-based solution will improve efficiency, enhance customer service, and support sustainable growth.

---

## 8. Conclusion

This case study examined current operations of Faith Laundry Shop and identified challenges related to manual processes, limited tracking, and lack of automated reporting.

The findings demonstrate a clear need for a system-based solution and provide the foundation for requirements definition, system design, and implementation.
