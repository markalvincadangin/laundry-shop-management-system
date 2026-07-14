# Research: System Audit & Coming Soon UX

## Coming Soon UX

- **Decision**: Add an `isComingSoon: boolean` flag to the objects in `frontend/src/config/navigation.ts`. Update the sidebar to render a small, disabled UI badge when this flag is true. Update `/messaging/page.tsx` to display a "Coming Soon" placeholder instead of the table.
- **Rationale**: This allows us to keep the code for the messaging feature intact while preventing users from interacting with it or thinking it is broken.
- **Alternatives considered**: Deleting the files (too destructive), removing the link entirely (hides the roadmap from users).

## UI Consistency Audit

- **Decision**: Conduct a sweep of `src/app/(dashboard)/*` to ensure standard Tailwind classes are used for spacing (e.g., `p-6`, `space-y-4`) and that table components use the standard `table.tsx` or `Card` components.
- **Rationale**: Manual sweep combined with linter enforcement ensures visual parity.

## Business Rules Integrity Audit

- **Decision**: Execute the backend unit tests (`make test-backend`) and manually trace the coverage of `OrderService` pricing logic against `BR-PR-01` through `BR-PR-05`. If coverage is missing, write the missing JUnit tests.
- **Rationale**: Unit tests provide the highest level of confidence for strict mathematical rules.
