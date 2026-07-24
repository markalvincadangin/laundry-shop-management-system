# Feature Specification: Customers Module

**Feature Branch**: `main` (Legacy)

**Created**: 2026-07-05

**Status**: Migrated

**Input**: Reverse-engineered from existing source code.

## User Scenarios & Testing

### User Story 1 - Customer Registration & Identity (Priority: P1)
Staff members must be able to register a new customer by providing their first name, last name, and contact number. The system must prevent duplicate registrations to ensure order history remains unified.

**Acceptance Scenarios**:
1. **Given** a new customer, **When** staff submits their details, **Then** the system creates a customer record and makes it immediately available for order intake.
2. **Given** an existing customer in the database, **When** staff attempts to register a new customer with the exact same first name, last name, and contact number, **Then** the system rejects the creation to prevent duplicates.

### User Story 2 - Customer Management & Search (Priority: P2)
Staff need to search for customers, view their details, update their contact information, and toggle their active status if they are no longer doing business with the shop.

**Acceptance Scenarios**:
1. **Given** a large database of customers, **When** staff searches by name or filters by active status, **Then** the system returns paginated results matching the criteria.
2. **Given** an active customer, **When** staff toggles their status, **Then** the customer is marked inactive and the cache is immediately invalidated so frontend queries reflect the new state.

## Requirements 

### Functional Requirements

- **FR-001**: System MUST enforce uniqueness on the composite key of `(firstName, lastName, contactNumber)`.
- **FR-002**: System MUST utilize caching (`CacheConfig.CACHE_CUSTOMERS`) for single-customer lookups to reduce database load.
- **FR-003**: System MUST evict the specific customer's cache entry upon `update` or `toggleActive` operations.
- **FR-004**: System MUST provide dynamic criteria-based search/filtering (`query`, `isActive`, `from`, `to`).

### Key Entities

- **Customer**: Represents an individual doing business with the laundry shop. Tracks their contact details and active state.

### Database Migrations
- **Flyway Target**: `V1__init.sql`
- **Schema Changes**: `customers` table established.

### API Contracts
- **Endpoints Needed**: `POST /api/v1/customers`, `GET /api/v1/customers/{id}`, `GET /api/v1/customers`, `PUT /api/v1/customers/{id}`, `PATCH /api/v1/customers/{id}/toggle-active`
- **Security**: Authenticated Staff and Admin roles.

## Success Criteria

### Measurable Outcomes
- **SC-001**: Duplicate identity registrations are rejected 100% of the time.
- **SC-002**: Fetches for individual customers hit the cache, lowering response times for subsequent reads.
