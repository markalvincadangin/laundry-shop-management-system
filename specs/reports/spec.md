# Feature Specification: Reports Module

**Feature Branch**: `main` (Legacy)

**Created**: 2026-07-05

**Status**: Migrated

**Input**: Reverse-engineered from existing source code.

## User Scenarios & Testing

### User Story 1 - Dashboard Analytics (Priority: P1)
Store managers and administrators must be able to view financial analytics on the dashboard, including daily, monthly, and yearly revenue aggregations.

**Acceptance Scenarios**:
1. **Given** an active store with payments, **When** a manager views the dashboard, **Then** they see a trend line charting revenue over a selected date range.
2. **Given** a specific day, **When** a manager queries daily sales, **Then** the system returns the total income and a breakdown of revenue by payment method (CASH, GCASH, MAYA).

## Requirements 

### Functional Requirements

- **FR-001**: System MUST calculate aggregate `totalIncome` strictly from recorded `Payment` entities, ignoring `Order` totals to ensure accuracy of actual money received.
- **FR-002**: System MUST provide time-series aggregations (Daily, Monthly, Yearly).
- **FR-003**: System MUST group daily sales by `PaymentMethod`.

### Key Entities

- **Reports**: Derived read-only aggregations based on the `payments` table.

### Database Migrations
- **Flyway Target**: N/A (Relies on `V1__init.sql` payments table)
- **Schema Changes**: None. Uses SQL aggregations (`SUM()`, `COUNT()`, `GROUP BY`).

### API Contracts
- **Endpoints Needed**: `GET /api/v1/reports/sales/trend`, `GET /api/v1/reports/sales/daily`, `GET /api/v1/reports/sales/monthly`, `GET /api/v1/reports/sales/yearly`
- **Security**: Authenticated Staff and Admin roles.

## Success Criteria

### Measurable Outcomes
- **SC-001**: Financial reports match the physical cash drawer and digital wallet histories 100% of the time because they are derived strictly from the ledger (`payments` table).
