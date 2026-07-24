# Feature Specification: Service Rates Module

**Feature Branch**: `main` (Legacy)

**Created**: 2026-07-05

**Status**: Migrated

**Input**: Reverse-engineered from existing source code.

## User Scenarios & Testing

### User Story 1 - Dynamic Pricing Engine Configuration (Priority: P1)
Administrators must be able to configure global service rates (Base Price, Kg Limit per load, Price per Extra Minute) that power the pricing engine for all new orders.

**Acceptance Scenarios**:
1. **Given** an administrator, **When** they update the active service rate, **Then** the cache is immediately invalidated and all subsequent order previews and creations utilize the new pricing formulas.
2. **Given** a request for a specific named service rate (e.g., "Blankets"), **When** the system cannot find it, **Then** it gracefully falls back to the default active service rate.

## Requirements 

### Functional Requirements

- **FR-001**: System MUST prevent duplicate service rate names during creation.
- **FR-002**: System MUST utilize caching (`CacheConfig.CACHE_SERVICE_RATES`) for active rate lookups to ensure the order intake flow remains highly performant.
- **FR-003**: System MUST evict all rate cache entries upon any create/update operation to prevent stale pricing logic.
- **FR-004**: System MUST allow fallback to a default active rate if a named service type query returns empty.

### Key Entities

- **ServiceRate**: Global pricing configuration variables defining base limits, prices, and status.

### Database Migrations
- **Flyway Target**: `V3__service_rates.sql`
- **Schema Changes**: `service_rates` table established with initial seed values.

### API Contracts
- **Endpoints Needed**: `POST /api/v1/rates`, `PUT /api/v1/rates/{id}`, `GET /api/v1/rates`, `GET /api/v1/rates/active`
- **Security**: Authenticated Staff (Read), Admin roles (Write).

## Success Criteria

### Measurable Outcomes
- **SC-001**: Pricing configurations are fetched seamlessly without repeated DB hits during rapid order intake.
