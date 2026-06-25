# Risk Management Plan
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** RMP-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Identify risks, evaluate impact, and establish mitigation strategies  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Risk Management Plan
- **Confidentiality:** Internal / Academic Use

---

## 1. Purpose

This document identifies potential risks that could impact the successful development, deployment, and adoption of the Faith Laundry Shop Management System. It evaluates the probability and impact of each risk and establishes actionable mitigation strategies to minimize disruptions to the project schedule and the daily operations of the business.

## 2. Risk Identification & Mitigation Matrix

| Risk ID | Risk Category | Risk Description | Probability | Impact | Mitigation Strategy | Risk Admin |
|---------|---------------|------------------|-------------|--------|---------------------|------------|
| **R01** | User Adoption | Staff resistance to unfamiliar technology or fear of making computer errors. | Medium | High | Conduct comprehensive process walkthroughs and provide basic system orientation. Ensure the UI design is simple, practical, and heavily validated during prototyping. | Training Lead |
| **R02** | Schedule | Project delays due to the limited availability of the Business Admin (Sponsor) because of daily operational duties. | High | Medium | Schedule regular, brief review meetings aligned with the Admin's availability. Present clear prototypes for quick feedback and establish firm approval checkpoints. | Project Manager |
| **R03** | Technical / Security | Admin's concern regarding data security and system complexity. | Low | High | Implement standard database security measures, secure role-based access control (Admin vs. Staff), and regular data backup protocols. | System Architect |
| **R04** | Scope | Requirement changes or delayed feedback impacting the 12-week academic SDLC timeline. | Medium | High | Document and confirm all requirements formally via sign-offs. Strictly control scope creep (e.g., firmly exclude mobile apps or SMS gateways as defined in the charter). | Business Analyst |
| **R05** | Operational Transition | Customer dissatisfaction if service delays or errors occur during the transition from the manual logbook to the digital system. | Medium | Medium | Minimize service disruption by launching the system in a pilot form. Clearly communicate the new order reference tracking process to customers during the transition. | Deployment Lead |

## 3. Contingency Plan

In the event of critical system failure or prolonged power outage during the pilot deployment, the shop will temporarily revert to the existing paper-based logbook and physical tagging system to ensure zero interruption to customer service. All manual records will be retroactively entered into the system by the Data Manager once operations normalize.
