# System Architecture
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** ARCH-001  
> **Version:** 1.0  
> **Date:** 2026-05-16  
> **Purpose:** Describe the high-level architecture of the system  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Architectural Design
- **Primary Source:** System Design Phase
- **Related Documents:** [Technology Stack](15-technology-stack.md), [Data Flow Diagram](18-dfd.md)
- **Confidentiality:** Internal / Academic Use

---

This document describes the high-level architecture of the Faith Laundry Shop Management System.

## 1. Architectural Pattern
The system follows a standard **Client-Server Architecture** utilizing a modern API-driven approach.

### 1.1 Presentation Layer (Frontend)
- Built with **Next.js**.
- Runs in the browser of the Admin or Staff.
- Communicates with the backend exclusively via RESTful JSON APIs.
- Responsible for routing, UI rendering, form validation, and user interaction.

### 1.2 Application Layer (Backend)
- Built with **Spring Boot**.
- Acts as the central hub for business logic, authentication, and database transactions.
- Exposes secure endpoints (`/api/v1/...`).
- Validates all incoming data ensuring business rules (like the 8kg per load limit) are strictly enforced at the server level.

### 1.3 Data Layer (Database)
- Uses **PostgreSQL**.
- Stores persistent data including user credentials, customer profiles, laundry orders, and payment histories.
- Data integrity is maintained via foreign keys, constraints, and transactions.

## 2. Deployment Architecture
The system is containerized using Docker, allowing the frontend, backend, and database to run as isolated but interconnected services on the host machine or cloud provider.
