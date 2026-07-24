# Research & Clarifications: Offline-First Standalone System Transition

This document captures the research findings and architectural decisions made during the planning phase for the offline-first standalone system.

## Findings from Harness Exploration

- **Decision**: Next.js App Router Static Export Workaround
- **Rationale**: Next.js 14 requires `generateStaticParams()` to be exported from Server Components when `output: 'export'` is active. Because the existing dynamic routes (`customers/[id]` and `orders/[id]`) are marked with `"use client"`, they cannot export this function directly. 
- **Resolution**: The `page.tsx` files must be converted into Server Component wrappers that export `generateStaticParams()` and return `[]` to allow dynamic client-side resolution, while importing the client-side component (e.g., `client.tsx`).

- **Decision**: `pgcrypto` for UUID Generation
- **Rationale**: To enforce globally unique identifiers across offline systems, the database must generate UUIDs. 
- **Resolution**: `V1__init.sql` will include `CREATE EXTENSION IF NOT EXISTS pgcrypto;` and all primary keys will be set to `UUID DEFAULT gen_random_uuid()`.

- **Decision**: Transactional Outbox Pattern implementation
- **Rationale**: `OutboxEvent` and `SyncWorker` must guarantee atomicity and at-least-once delivery.
- **Resolution**: The backend is already properly structured to support `OutboxService` publishing events in the same transaction context as the domain mutations. `SyncWorker` polls every 5 seconds.
