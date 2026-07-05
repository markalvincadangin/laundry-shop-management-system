# Contributing to Faith Laundry Shop Management System

## Branch Naming

Use the following prefixes:

| Prefix | Purpose |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `refactor/` | Code restructuring (no behavior change) |
| `docs/` | Documentation-only changes |
| `chore/` | Dependency updates, CI/CD, tooling |

Example: `feat/order-cancellation`, `fix/cors-403`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add order cancellation endpoint
fix: resolve CORS 403 on login
refactor: move DTOs to feature packages
docs: update ARCHITECTURE.md coupling section
chore: bump Spring Boot to 3.5.14
```

## Pull Request Process

1. Create a feature branch from `develop`.
2. Make your changes, ensuring all tests pass locally:
   ```bash
   make test-backend    # Backend: compile + unit tests
   make test-frontend   # Frontend: lint + typecheck + vitest
   ```
3. Open a PR against `develop` using the PR template.
4. Ensure CI passes (GitHub Actions will run automatically).
5. Request review from `@markalvincadangin`.

## Architecture Rules

Before submitting, verify your changes respect these constraints:

### Backend (Feature-First)
- **Features do not import each other's services/mappers/controllers.** Entity-level JPA references are acceptable (see [`docs/05-tech-design/architecture.md`](05-tech-design/architecture.md) — ARCH-001 §Dependency Rules).
- DTOs live inside their feature's `dto/` package, not in `shared/`.
- `shared/` is reserved for truly cross-cutting concerns (`PageResponse`, `ErrorResponse`, `GlobalExceptionHandler`).

### Frontend (App Router Layering)
- `app/` → `components/` → `lib/` dependency direction. Never import upward.
- API clients live in `lib/api/`, validation schemas in `lib/validation/`.
- `stores/` uses React Context API (not Zustand) — see the comment at the top of each file.

### Polyglot Contract Sync
- Any backend DTO change **must** be accompanied by a matching frontend Zod schema update in the **same PR**.

### UX & Business Logic Alignment
- **UX Standards**: All frontend changes must adhere to the `docs/00-context/content-inventory.md` standards. Follow the NN/g Framework and ensure the Doherty Threshold (instant feedback) is met for loading states.
- **Business Rules Enforcement**: All pricing calculations (e.g., the ₱120 / 8kg load rule, ₱1 per extra minute) MUST be handled by the backend engine (`OrderService`). **Never** hardcode pricing formulas in the frontend. This ensures single-source-of-truth accuracy as requested in the Case Study.
