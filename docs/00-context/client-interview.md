# Client Interview & Observation
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** INT-001  
> **Version:** 1.0  
> **Date:** 2026-02-04  
> **Purpose:** Raw interview notes and observations for requirements derivation  
> **Status:** Baseline (Reference)

---

## Document Control
- **Document Type:** Interview Notes
- **Primary Source:** Semi-structured interview and on-site observation
- **Related Documents:** [Case Study (CS-001)](case-study.md), [User Stories](../02-requirements/user-stories.md), [Business Rules](../02-requirements/business-rules.md)
- **Confidentiality:** Internal / Academic Use

---

## 1. Interview Objective

To understand the current operational process, identify existing problems, and gather system requirements for a Laundry Management System that will automate tracking, recording, and reporting of laundry shop activities.

---

## 2. Interview Context

- **Location:** Ilaya, Tabuc Suba Jaro, Iloilo City
- **Duration:** 45–60 minutes
- **Interviewers:** Student System Analysis Team
- **Source File:** Faith Laundry Shop Interview.docx

---

## 3. Business Background

### 3.1 Q1. How long has your laundry shop been operating?
- Approximately three (3) years; established in 2022.

### 3.2 Q2. How many people work here (including you)?
- Two (2) individuals: one staff member and the owner. The owner is actively involved in daily operations.

### 3.3 Q3. What services do you currently offer?
- Wash, Dry, Fold

---

## 4. Current Process (AS-IS)

### 4.1 Customer Intake

**Q4. What happens when a customer brings laundry?**
- Staff measures total weight in kilograms.
- Laundry is sorted by customer preference (e.g., white and colored clothing).
- Items are washed, dried, and folded.
- Laundry is placed in a labeled bag with the customer's name and prepared for pickup.

**Q5. Do you issue any receipt or claim stub?**
- Yes. Receipt includes: customer name, contact number, date of transaction, total payment amount, laundry shop name, and authorized signature.

### 4.2 Order Tracking

**Q6. How do you track customer laundry while it is being processed?**
- Tags. Each order is tagged with the customer's name. Status is monitored through staff recall and logbook verification.

**Q7. Have you experienced issues like lost items or mixed orders?**
- Sometimes. Occasional mixing occurs during peak hours or when multiple rush orders are processed.

### 4.3 Pricing & Services

**Q8. How do you compute prices?**
- Per load. One (1) load costs **₱120** and covers up to **8 kg**. Exceeding 8 kg is charged as another load.

**Q9. Are there special pricing rules (rush orders, stains, blankets, etc.)?**
- Standard rate applies to all items. Additional charges for extra fabric conditioner or extended washing time due to excessive dirt — **₱1 per extra minute** of machine use.

### 4.4 Payment Process

**Q10. When does the customer usually pay?**
- Upon pickup.

**Q11. How do you record payments?**
- Notebook. Payments are recorded manually as a reference for transaction records and customer payment history.

### 4.5 Release of Laundry

**Q12. How do you know when laundry is ready for pickup?**
- Staff checks the logbook and inspects the designated laundry area to confirm completion.

**Q13. What do you check before releasing laundry to the customer?**
- Staff verifies the stub, customer name, number of items, and condition of clothes prior to release.

---

## 5. Records & Data Management

### 5.1 Q14. What records do you currently keep?
- Customer names, contact numbers, payments, daily sales.

### 5.2 Q15. Are these records paper-based or digital?
- Paper.

### 5.3 Q16. How long do you keep records?
- Approximately one (1) month, then archived for storage.

---

## 6. Reporting & Management Needs

### 6.1 Q17. Do you track daily or monthly income?
- Yes, manually.

### 6.2 Q18. What reports would you like to see but currently cannot?
- Pending orders, customer history. The owner wants automated reports showing total monthly and yearly income, with the ability to compare performance across periods.

---

## 7. Problems & Pain Points

### 7.1 Q19. What are the most common problems in daily operations?
- Washing machine malfunctions
- Manual and time-consuming record keeping
- Power interruptions

### 7.2 Q20. Which problem causes the most stress or loss?
- Machine malfunctions — computerized, interconnected machines are costly to repair; downtime results in lost income.

---

## 8. Technology Readiness

### 8.1 Q21. Do you currently use any computer or mobile device for business?
- Yes.

### 8.2 Q22. Would you be willing to use a simple computer-based system?
- Yes.

### 8.3 Q23. Who would most likely use the system?
- Owner, Staff.

---

## 9. Stakeholder Confirmation

### 9.1 Q24. Who is responsible for:
- **Accepting laundry:** Owner and staff
- **Recording orders:** Owner and staff
- **Handling payments:** Owner and staff
- **Managing records:** Owner

---

## 10. Closing Questions

### 10.1 Q25. If a system could solve ONE problem for you, what should it be?
- Improved communication with customers, including digital notifications and order tracking. Customers should receive updates and track laundry status.

### 10.2 Q26. Are you willing to participate in follow-up interviews or prototype reviews?
- Yes.

---

## 11. Observation Checklist (Do Not Ask — Observe)
- Staff workload
- Paper forms used
- Workspace constraints

---

## 12. Interviewers Summary

### 12.1 Key Problems Identified
- Reliance on manual record keeping
- Occasional order mix-ups during peak hours
- High dependency on machinery prone to malfunction

### 12.2 Opportunities for System Improvement
- Automation of order tracking and payment records
- Generation of real-time sales and income reports
- Improved customer communication through digital notifications and tracking

**Traceability:** Interview findings inform [User Stories](../02-requirements/user-stories.md) and [Business Rules](../02-requirements/business-rules.md).
