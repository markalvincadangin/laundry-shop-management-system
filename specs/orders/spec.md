# Feature Specification: Orders Module

**Feature Branch**: `main` (Legacy)

**Created**: 2026-07-05

**Status**: Migrated

**Input**: Reverse-engineered from existing source code.

## User Scenarios & Testing

### User Story 1 - Order Intake & Live Pricing (Priority: P1)
Staff members must be able to intake a new laundry order, select the service type, weigh the laundry, and see a live pricing preview before submitting.

**Why this priority**: Core revenue-generating activity.

**Acceptance Scenarios**:
1. **Given** a new customer, **When** creating an order with 12kg of laundry under "Standard Wash", **Then** the system prices it accurately based on the active ServiceRate.
2. **Given** an incomplete order form, **When** staff requests a live price preview, **Then** the backend computes the estimated total without persisting the order to the database.

### User Story 2 - Order Lifecycle Management (Priority: P1)
Staff can view all orders, track their status (RECEIVED, WASHING, DRYING, RELEASED), and update the order to add extra minutes or add-ons if it hasn't been paid for yet.

**Why this priority**: Required for operational tracking.

**Acceptance Scenarios**:
1. **Given** an unpaid order, **When** staff adds 10 extra minutes, **Then** the order total increases according to the `pricePerExtraMinute` snapshot.
2. **Given** a PAID order, **When** staff attempts to add extra minutes, **Then** the system rejects the update unless the actor is an ADMIN.

## Requirements 

### Functional Requirements

- **FR-001**: System MUST auto-generate a unique Reference Number (`LDR-YYYYMMDD-XXXX`) on order creation.
- **FR-002**: System MUST capture a snapshot of the active ServiceRate (Base Price, Kg Limit, Extra Minute Rate) inside the Order entity so future rate changes don't affect past orders.
- **FR-003**: System MUST provide a `preview()` endpoint to calculate totals safely without persisting data.
- **FR-004**: System MUST strictly restrict updates to PAID or RELEASED orders to ADMIN users only.
- **FR-005**: System MUST compute daily order statistics (`todaysOrders`, `inProgress`, `readyForPickup`, `todaysRevenue`).

### Key Entities

- **Order**: Represents a laundry transaction containing weight, extra minutes, snapshots of service rates, and computed totals.
- **OrderAddOn**: Represents additional line items purchased with the order (e.g., detergent, bleach).

### Database Migrations
- **Flyway Target**: `V1__init.sql`
- **Schema Changes**: `orders` and `order_add_ons` tables established.

### API Contracts
- **Endpoints Needed**: `POST /api/v1/orders`, `POST /api/v1/orders/preview`, `PUT /api/v1/orders/{id}`, `GET /api/v1/orders`, `GET /api/v1/orders/stats`
- **Security**: Authenticated Staff and Admin roles.

## Success Criteria

### Measurable Outcomes
- **SC-001**: Pricing computations exactly match the configured service rates down to the cent.
- **SC-002**: Reference numbers never collide, attempting up to 10 retries if random suffix conflicts.
