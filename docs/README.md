# Documentation Index

## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** INDEX-001  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Central guide to all project documentation  
> **Status:** Living Document

---

## Document Control

- **Document Type:** Documentation Index
- **Related Documents:** All documents in `/docs` folder
- **Confidentiality:** Internal / Academic Use

---

## Documentation Index

### 00-context/ — Project Background


| Document                                              | Description                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| [case-study.md](00-context/case-study.md)             | Client background, business profile, current problems, and pain points. |
| [client-interview.md](00-context/client-interview.md) | Raw interview notes and observations from Faith Laundry Shop.           |


### 01-scope/ — Project Boundaries


| Document                                      | Description                                               |
| --------------------------------------------- | --------------------------------------------------------- |
| [project-scope.md](01-scope/project-scope.md) | MVP vs. post-MVP features, deliverables, and constraints. |


### 02-requirements/ — Functional & Non-Functional Requirements


| Document                                                                         | Description                                                             |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [user-stories.md](02-requirements/user-stories.md)                               | All user stories (US-01 to US-11) defining functional behavior.         |
| [business-rules.md](02-requirements/business-rules.md)                           | Enforceable business rules (BR-PR-*, BR-OL-*, BR-PAY-*, BR-NOTIF-*).    |
| [non-functional-requirements.md](02-requirements/non-functional-requirements.md) | Security, performance, availability, audit, usability, maintainability. |


### 03-process/ — Business Process Flows


| Document                                  | Description                                             |
| ----------------------------------------- | ------------------------------------------------------- |
| [to-be-flow.md](03-process/to-be-flow.md) | Future-state process flows after system implementation. |


### 04-data-design/ — Database Schema


| Document                                      | Description                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| [erd.dbml](04-data-design/erd.dbml)           | Database schema definition (DBML) — tables, columns, constraints, relationships. |
| [data-notes.md](04-data-design/data-notes.md) | Additional notes on data design decisions.                                       |


### 05-tech-design/ — Technical Design


| Document                                          | Description                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| [architecture.md](05-tech-design/architecture.md) | System architecture, tech stack, layered design, data flows.                  |
| [FRONT-001](05-tech-design/frontend-design-spec.md) | Frontend Design Specification | HCI/UI Standards |
| [FRONT-002](05-tech-design/frontend-structure.md) | Frontend Structure Specification | Project Organization |
| [API-001](05-tech-design/openapi.yaml) | OpenAPI Specification | API Contract |


### 06-implementation/ — Deployment & Operations


| Document                                                               | Description                                                                      |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [deployment-guide.md](06-implementation/deployment-guide.md)           | Deployment instructions (dev and production), environment configuration, backup. |
| [user-manual.md](06-implementation/user-manual.md)                     | End-user guide for Admin and Staff.                                              |
| [handover-checklist.md](06-implementation/handover-checklist.md)       | Handover session agenda and sign-off.                                            |
| [release-notes-mvp-v1.md](06-implementation/release-notes-mvp-v1.md)   | MVP v1.0 release notes and known limitations.                                    |
| [implementation-status.md](06-implementation/implementation-status.md) | Gap analysis: implemented vs. required per docs (user stories, BRs, API, NFRs).  |


### Root-Level Guides


| Document                                                 | Description                                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [GETTING_STARTED.md](GETTING_STARTED.md)                 | Step-by-step local setup and implementation guide (Docker, database, backend, frontend). |
| [development-credentials.md](development-credentials.md) | Default development credentials for database, seeded users, and test accounts.           |


---

## Source of Truth Map


| Question                                | Source of Truth                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **What features should we build?**      | [user-stories.md](02-requirements/user-stories.md) — US-01 to US-11                                                   |
| **What rules must the system enforce?** | [business-rules.md](02-requirements/business-rules.md) — BR-PR-*, BR-OL-*, BR-PAY-*, BR-NOTIF-*                       |
| **What does the database look like?**   | [erd.dbml](04-data-design/erd.dbml) — Tables, columns, constraints, relationships                                     |
| **What are the API endpoints?**         | [openapi.yaml](05-tech-design/openapi.yaml) — Request/response contracts, status codes                                |
| **How is the system structured?**       | [architecture.md](05-tech-design/architecture.md) — Layered design, tech stack, data flows                            |
| **What does the UI look like?**         | [frontend-design-spec.md](05-tech-design/frontend-design-spec.md) — Design system, HCI principles, interaction patterns |
| **What rules (non-functional)?**        | [non-functional-requirements.md](02-requirements/non-functional-requirements.md) — Security, performance, audit, etc. |
| **What's in/out of scope?**             | [project-scope.md](01-scope/project-scope.md) — MVP vs. post-MVP features                                             |
| **How do we deploy and operate?**       | [deployment-guide.md](06-implementation/deployment-guide.md) — Dev/prod deployment, backup                            |
| **Why does the client need this?**      | [case-study.md](00-context/case-study.md) — Business problems and pain points                                         |


