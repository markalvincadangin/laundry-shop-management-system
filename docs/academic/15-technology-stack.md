# Technology Stack
## Faith Laundry Shop Management System

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** TECH-001  
> **Version:** 1.0  
> **Date:** 2026-05-16  
> **Purpose:** Outline the software, frameworks, and tools used for development  
> **Status:** Baseline

---

## Document Control
- **Document Type:** Technical Specification
- **Primary Source:** Development Team
- **Related Documents:** [System Architecture](16-system-architecture.md)
- **Confidentiality:** Internal / Academic Use

---

This document outlines the software, frameworks, and tools used to develop the Faith Laundry Shop Management System, along with the justification for their selection.

## 1. Frontend Development (Client-Side)
*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **Justification:** Next.js provides a robust, fast, and scalable framework for building modern web applications. TypeScript ensures type safety, reducing runtime errors. Tailwind CSS allows for rapid UI development and prototyping.

## 2. Backend Development (Server-Side)
*   **Framework:** Spring Boot 3.5
*   **Language:** Java 21
*   **Architecture:** RESTful API (MVC Pattern)
*   **Justification:** Java 21 and Spring Boot offer an enterprise-grade, secure, and highly reliable backend environment. Spring Data JPA simplifies database interactions, and Spring Security provides robust authentication mechanisms.

## 3. Database
*   **Database Management System:** PostgreSQL
*   **Migration Tool:** Flyway
*   **Justification:** PostgreSQL is a powerful, open-source object-relational database system known for reliability, feature robustness, and performance. Flyway ensures database schemas remain consistent across environments.

## 4. Development & Deployment Tools
*   **Version Control:** Git & GitHub
*   **Containerization:** Docker & Docker Compose
*   **Testing:** JUnit 5, Testcontainers (Backend), Jest (Frontend)
*   **Justification:** Docker ensures that the system runs identically in development, testing, and production environments, eliminating the "it works on my machine" problem.
