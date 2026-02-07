# Laundry Shop Management System
## Client Interview & Observation

> **Client:** Faith Laundry Shop  
> **Project Title:** Laundry Shop Management System  
> **Interview Type:** Semi-Structured Interview and Observation  
> **Interviewers:** Student System Analysis Team  
> **Date:** 2026-02-04  
> **Location:** Ilaya, Tabuc Suba Jaro, Iloilo City  
> **Interview Duration:** 45–60 minutes

---

## Document Control
- **Document ID:** INT-001
- **Version:** 1.0
- **Status:** Baseline (Reference)
- **Source File:** Faith Laundry Shop Interview.docx

---

## Interview Objective
To understand the current operational process, identify existing problems, and gather system requirements for a Laundry Management System that will automate tracking, recording, and reporting of laundry shop activities.

---

## Business Background Information
**Purpose:** Context for the Problem Statement

### Q1. How long has your laundry shop been operating?
**Notes:**
- The laundry shop has been operating for approximately three (3) years and was established in 2022.

### Q2. How many people work here (including you)?
**Notes:**
- The business is operated by two (2) individuals: one staff member and the owner. The owner is also actively involved in daily operations.

### Q3. What services do you currently offer?
- Wash
- Dry
- Fold

---

## Current Process (AS-IS System)
**Purpose:** Foundation for DFD and Process Matrix

### Customer Intake

#### Q4. What happens when a customer brings laundry?
**Notes:**
- Upon receiving the laundry, the staff first measures the total weight in kilograms.
- The laundry is then sorted according to the customer’s preference, such as separating white and colored clothing.
- After sorting, the items are washed using the washing machine, dried, and folded.
- Finally, the laundry is placed in a labeled bag bearing the customer’s name and prepared for pickup.

#### Q5. Do you issue any receipt or claim stub?
- Yes

**If yes, what information is written?**  
**Notes:**
- The receipt includes the customer’s name, contact number, date of transaction, total payment amount, laundry shop name, and an authorized signature.

---

## Order Tracking

### Q6. How do you track customer laundry while it is being processed?
- Tags

**Notes:**
- Each laundry order is tagged with the customer’s name.
- The status of the laundry is monitored through staff recall and verification using a logbook to determine whether the order is completed or still in process.

### Q7. Have you experienced issues like lost items or mixed orders?
- Sometimes

**Notes:**
- Occasional mixing of clothes occurs, particularly during peak hours or when multiple rush orders are processed simultaneously.

---

## Pricing & Services

### Q8. How do you compute prices?
- Per load

**Notes:**
- Pricing is computed per load. One (1) load costs **PHP 120** and covers up to **eight (8) kilograms** of laundry.
- If it exceeds the limit (8 kg), it will be considered another load.

### Q9. Are there special pricing rules (rush orders, stains, blankets, etc.)?
**Notes:**
- The standard rate applies to all items.
- Additional charges may be applied if the customer requests extra fabric conditioner or if the laundry requires extended washing time due to excessive dirt.
- In such cases, an additional charge of **PHP 1 per extra minute** of machine use is added.

---

## Payment Process

### Q10. When does the customer usually pay?
- Upon pick-up

### Q11. How do you record payments?
- Notebook

**Notes:**
- Payments are recorded manually in a notebook, which serves as a reference for transaction records and customer payment history.

---

## Release of Laundry

### Q12. How do you know when laundry is ready for pickup?
**Notes:**
- The staff checks the logbook and inspects the designated laundry area to confirm completion.

### Q13. What do you check before releasing laundry to the customer?
**Notes:**
- The staff verifies the stub, customer name, number of items, and the condition of the clothes prior to release.

---

## Records & Data Management
**Purpose:** Input for ERD and Data Dictionary

### Q14. What records do you currently keep?
- Customer names
- Contact numbers
- Payments
- Daily sales

### Q15. Are these records paper-based or digital?
- Paper

**Notes:**
- Records are primarily paper-based.

### Q16. How long do you keep records?
**Notes:**
- Records are kept for approximately one (1) month, after which they are archived for storage.

---

## Reporting & Management Needs
**Purpose:** Forms & Reports Design

### Q17. Do you track daily or monthly income?
- Yes

**Notes:**
- Yes, income is tracked manually.

### Q18. What reports would you like to see but currently cannot?
- Pending orders
- Customer history

**Notes:**
- The owner would like access to automated reports showing total monthly and yearly income, with the ability to compare performance across different periods.

---

## Problems & Pain Points
**Purpose:** Core input for Problem Statement

### Q19. What are the most common problems you encounter in daily operations?
**Problems mentioned:**
- Washing machine malfunctions
- Manual and time-consuming record keeping
- Power interruptions

### Q20. Which problem causes the most stress or loss?
**Notes:**
- Machine malfunctions cause the greatest stress and financial impact, as the machines are computerized, interconnected, and costly to repair, resulting in downtime and lost income.

---

## Technology Readiness
**Purpose:** Technical & Organizational Feasibility

### Q21. Do you currently use any computer or mobile device for business?
- Yes

### Q22. Would you be willing to use a simple computer-based system?
- Yes

### Q23. Who would most likely use the system?
- Owner
- Staff

---

## Stakeholder Confirmation
**Purpose:** Stakeholder Analysis

### Q24. Who is responsible for:
- **Accepting laundry?** Owner and staff
- **Recording orders?** Owner and staff
- **Handling payments?** Owner and staff
- **Managing records?** Owner

---

## Closing Questions

### Q25. If a system could solve ONE problem for you, what should it be?
**Notes:**
- The owner emphasized the need for improved communication with customers, including digital notifications and order tracking.
- Customers should be able to receive updates and track their laundry status.

### Q26. Are you willing to participate in follow-up interviews or prototype reviews?
- Yes

---

## Observation Checklist (Do Not Ask — Observe)
- Staff workload
- Paper forms used
- Workspace constraints

---

## Interviewer Summary

### Key Problems Identified
- Reliance on manual record keeping
- Occasional order mix-ups during peak hours
- High dependency on machinery prone to malfunction

### Opportunities for System Improvement
- Automation of order tracking and payment records
- Generation of real-time sales and income reports
- Improved customer communication through digital notifications and tracking features
