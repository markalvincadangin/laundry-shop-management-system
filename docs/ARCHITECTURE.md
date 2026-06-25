# System Architecture

## Overview

Faith Laundry Shop uses a modern **Polyglot Monorepo** architecture:
- **Backend**: Java 21, Spring Boot 3.2, PostgreSQL (Feature-First Architecture)
- **Frontend**: TypeScript, Next.js 14 App Router, Tailwind CSS, shadcn/ui

## Backend: Feature-First Packaging

The backend is structured by feature rather than by technical layer. This aligns with modern Spring Boot practices and prepares the codebase for potential future microservice extraction.

```
backend/src/main/java/com/himotech/laundryms/
├── customers/       # Customer entity, repo, service, controller, dto, mapper
├── orders/          # Order entity, repo, service, controller, dto, mapper
├── payments/        # Payment entity, repo, service, controller, dto, mapper
├── ...
└── shared/          # Generic DTOs, exceptions, enums used across features
```

### Dependency Rules & Coupling Constraint
- **Rule**: Features should minimize dependencies on each other's business logic (services, mappers, controllers).
- **Constraint (Acknowledged Monolithic Coupling)**: Because this is a Spring Data JPA Monolith, entities natively reference each other (e.g., `Order` having a `@ManyToOne Customer`). This is a **data-layer** concern, not a feature-module concern, and these cross-package imports are both necessary and correct for our scale. 
- **Diagnostic Reality**: A coupling diagnostic run during the feature-first migration revealed that `orders/` still directly imports `customers/` repositories and entities inside its services (e.g. `OrderService` calling `CustomerRepository`). While a strict decoupled architecture would require inter-service communication exclusively through DTOs, we consciously decided to accept this pragmatic coupling tradeoff. This is a known architectural decision for our scale, not scope creep or an unfinished refactor.

## Frontend: App Router Dependency Flow

The Next.js frontend strictly follows the `app → components → lib` dependency rule:

```
frontend/src/
├── app/             # Next.js routing (auth, dashboard, public)
├── components/      # React components (ui/, features/, layout/)
├── lib/             # Core logic (api/, validation/, utils/)
├── stores/          # Client-side global state (Zustand/Context)
└── hooks/           # Custom React hooks (React Query)
```

### Dependency Rules
1. **`app/`** can import from anywhere.
2. **`components/`** can import from `lib/`, `stores/`, `hooks/`, but NEVER from `app/`.
3. **`lib/`** contains pure TypeScript (API clients, Zod schemas, utilities) and MUST NOT import React components.
