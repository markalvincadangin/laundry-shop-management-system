# Feature Specification: Payments Module

**Feature Branch**: `main` (Legacy)

**Created**: 2026-07-05

**Status**: Migrated

**Input**: Reverse-engineered from existing source code.

## User Scenarios & Testing

### User Story 1 - Payment Processing & Ledger (Priority: P1)
Staff members must be able to record payments for existing laundry orders and specify the payment method (CASH, GCASH, MAYA). Non-cash payments must require a tracking reference.

**Acceptance Scenarios**:
1. **Given** an active order, **When** staff attempts to record a GCASH payment without a reference number, **Then** the system rejects the transaction.
2. **Given** an order totaling ₱350.00, **When** staff submits a payment for exactly ₱350.00, **Then** the payment is successfully recorded and the order's payment status transitions to `PAID`.
3. **Given** a CANCELLED or already RELEASED order, **When** a payment is submitted, **Then** the system throws a Conflict exception.

### User Story 2 - Voiding Incorrect Transactions (Priority: P2)
Administrators must be able to void a recorded payment if it was mistakenly entered, reverting the order so it can be paid again.

**Acceptance Scenarios**:
1. **Given** a paid order, **When** an admin triggers a void operation, **Then** the order's payment status changes to `VOIDED`, the original payment record is soft-deleted, and an audit trail captures the event.

## Requirements 

### Functional Requirements

- **FR-001**: System MUST strictly validate that the `amountPaid` exactly matches the order's `grandTotal` down to 2 decimal places. Overpayments or partial payments are prohibited.
- **FR-002**: System MUST mandate a `paymentReference` string for all payment methods other than `CASH`.
- **FR-003**: System MUST prevent recording payments on orders that are in `CANCELLED` or `RELEASED` states.
- **FR-004**: System MUST allow voiding payments, which deletes the record from the 1-to-1 mapping but relies on the `AuditLog` aspect to preserve the historical trail.
- **FR-005**: System MUST prevent duplicate payments for the same order (1-to-1 constraint).

### Key Entities

- **Payment**: Represents the financial transaction tied to an Order. Tracks amount, method, receiver, and external reference numbers.

### Database Migrations
- **Flyway Target**: `V1__init.sql`
- **Schema Changes**: `payments` table established with unique constraint on `order_id`.

### API Contracts
- **Endpoints Needed**: `POST /api/v1/payments`, `POST /api/v1/payments/void/{orderId}`, `GET /api/v1/payments`, `GET /api/v1/payments/{id}`
- **Security**: Authenticated Staff and Admin roles.

## Success Criteria

### Measurable Outcomes
- **SC-001**: 100% prevention of partial or mismatched payments.
- **SC-002**: Zero recorded non-cash payments without reference numbers.
