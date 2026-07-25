# Documentation Index

## Laundry Shop Management System

> **Client:** Faith Laundry Shop (Baseline Reference)  
> **Prepared By:** Mark Alvin Cadangin  
> **Document ID:** INDEX-001  
> **Version:** 2.0  
> **Date:** 2026-07-21  
> **Purpose:** Central guide to all project documentation  
> **Status:** Living Document

---

## Document Control

- **Document Type:** Documentation Index
- **Related Documents:** All documents in `/docs` folder
- **Confidentiality:** Internal / Academic Use

---

## Getting Started

To run the application locally or deploy it to a Windows machine, we have fully automated scripts that handle the PostgreSQL database setup, environment variable configuration, and `.exe` installer wizard generation.

For full deployment instructions (including how to set up the Cloudflare Tunnel for online tracking), please see the [Deployment Guide](06-implementation/deployment-guide.md).

For development:
1. Ensure Java 21, Node.js 20+, and Docker are installed.
2. Run `make setup-env` to copy `.env.example` to `.env`.
3. Run `make up-db` to start the PostgreSQL test container.
4. Run `make run-backend` and `make run-frontend`.

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
| [schema.sql](04-data-design/schema.sql)       | Raw SQL schema definition.                                                       |

### 05-tech-design/ — Technical Design

| Document                                          | Description                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| [architecture.md](05-tech-design/architecture.md) | System architecture (Offline-First Tunnel Topology).                          |
| [frontend-design-spec.md](05-tech-design/frontend-design-spec.md) | Frontend Design Specification and HCI/UI Standards. |
| [openapi.yaml](05-tech-design/openapi.yaml)       | OpenAPI Specification (API Contract). |
| [test-traceability-matrix.md](05-tech-design/test-traceability-matrix.md) | Comprehensive test traceability matrix mapping all BR-xx rules and US-xx user stories to automated test suites. |

### 06-implementation/ — Deployment & Operations

| Document                                                               | Description                                                                      |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [deployment-guide.md](06-implementation/deployment-guide.md)           | Deployment instructions (Windows Standalone .exe installer wizard & WinSW).      |
| [user-manual.md](06-implementation/user-manual.md)                     | End-user guide for Admin and Staff.                                              |
| [handover-checklist.md](06-implementation/handover-checklist.md)       | Handover session agenda and sign-off.                                            |
| [release-notes-mvp-v1.md](06-implementation/release-notes-mvp-v1.md)   | MVP v1.0 release notes and known limitations.                                    |

### Root-Level & Contributor Guides

| Document                                                 | Description                                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [CONTRIBUTING.md](CONTRIBUTING.md)                       | Branch naming, commit message standards, and architecture/PR rules for contributors.     |
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


