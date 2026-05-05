## What changed?
- Fixed uncontrolled component warnings in IntakeWizard.
- Migrated frontend add-on state to `useFieldArray` for robust synchronization.
- Added explicit `@Mapping` for `addOns` in MapStruct's `OrderMapper.java`.

## Why?
- The frontend `+` button was failing to properly append add-ons to the price calculation due to state lifecycle issues.
- The backend `OrderMapper` was implicitly ignoring the `addOns` list, causing the order receipts (`ClaimStub`) to display empty add-on sections despite correct mathematical subtotals.

## User Stories (if applicable)
- [x] US-04: Process Order Add-ons and calculate total dynamically.

## Business Rules (if applicable)
- [x] BR-ORD-03: Add-on pricing must be reflected in the grand total and printed receipt.

## How to test
- [x] Backend: `.\mvnw.cmd test` (Windows) or `./mvnw test` (Unix) in `backend/` (if backend touched)
- [x] Frontend: `npm run lint && npm run test && npm run build` in `frontend/` (if frontend touched)
- [x] Database: `docker compose -f docker/docker-compose.yml --env-file docker/.env.docker up -d` from project root (if schema changed)

## Verification checklist
- [x] Tests pass locally
- [x] No hardcoded business rules in frontend
- [x] Entities match [ERD](docs/04-data-design/erd.dbml)
- [x] APIs match [OpenAPI](docs/05-tech-design/openapi.yaml) contract
- [x] Documentation updated if behavior changed

## Screenshots (if UI)
- Provided in PR review.
