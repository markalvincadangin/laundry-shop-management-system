# API Contract & Synchronization

This document explains how the Spring Boot backend and Next.js frontend share API contracts.

## The Polyglot Monorepo Reality

Because this project uses Java for the backend and TypeScript for the frontend, we cannot simply import a backend entity or DTO directly into a frontend component. There is a **language barrier** between the two sides.

### The "Contract" Gap
When a field is added to `CustomerDto.java` in the backend, the frontend does not automatically know about it. If the frontend's `CustomerSchema` (Zod) is not updated to match, validation will fail or data will be lost.

## Synchronization Rules

To maintain integrity across the stack, developers must follow these manual synchronization rules:

1. **Dual Updates**: Any change to a backend DTO (e.g., `orders/dto/CreateOrderRequest.java`) MUST be accompanied by a matching change in the corresponding frontend Zod schema (e.g., `frontend/src/lib/validation/order.ts`) in the **same Pull Request**.
2. **Type Generation**: The frontend uses OpenAPI schema generation. When backend endpoints change, the Swagger/OpenAPI spec updates. Make sure to regenerate the frontend types (`npm run generate-api` or equivalent, if set up) so `api.generated.ts` remains accurate.
3. **Zod as the Source of Truth on the Client**: While OpenAPI types describe the shape of the data, Zod schemas in `lib/validation/` are the active runtime enforcers for form inputs and mutations.
