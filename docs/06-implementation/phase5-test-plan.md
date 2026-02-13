# Phase 5 — Core Business Services: Test Plan

> **Phase:** 5 — Core Business Services [MVP]  
> **Document ID:** IMPL-005-TEST  
> **Version:** 1.0  
> **Date:** 2026-02-13  
> **Purpose:** Complete testing work (unit + integration) for Phase 5 service-layer business logic

---

## 1. Phase 5 Test Plan (High-Level)

### 1.1 Services Under Test

| Service | Methods | Primary Responsibility |
|---------|---------|------------------------|
| **OrderService** | `create(CreateOrderCommand)` | Order creation, pricing computation, reference generation, initial status |
| **OrderStatusService** | `updateStatus(Long, OrderStatus, UUID, String)` | Status transitions, release preconditions, status logging |
| **PaymentService** | `create(RecordPaymentCommand)` | Payment recording, amount validation, one-payment-per-order |
| **CustomerService** | `create(...)`, `findById(Long)`, `search(String)` | Customer CRUD, duplicate prevention, search |
| **ServiceRateService** | `getActiveRate()` | Active rate retrieval |

### 1.2 Business Rules Validated

| Rule | Service | Validation |
|------|---------|------------|
| **BR-PR-01** Base Load Pricing | OrderService | base_amount = total_loads × base_price_per_load |
| **BR-PR-02** Additional Load for Excess Weight | OrderService | total_loads = ceil(weight_kg / 8) |
| **BR-PR-03** Extra Washing Time Charge | OrderService | extra_minutes_amount = extra_minutes × ₱1 |
| **BR-PR-04** Optional Add-ons | OrderService | addons_total_amount summed from add-on items |
| **BR-OL-01** Unique Reference Number | OrderService | generateUniqueReferenceNumber() + existsByReferenceNumber check |
| **BR-OL-02** Initial Order Status | OrderService | current_status = RECEIVED |
| **BR-OL-03** Allowed Order Status Values | OrderStatusService | Reject invalid enum values |
| **BR-OL-04** Status Transition Control | OrderStatusService | Same-status rejection |
| **BR-OL-05** Release Preconditions | OrderStatusService | RELEASED only from READY_FOR_PICKUP |
| **BR-PAY-02** One Payment Per Order | PaymentService | existsByOrder_Id check, ConflictException |
| **BR-PAY-03** Payment Amount Validation | PaymentService | amount must equal order.grand_total |
| **BR-PAY-04** Payment Status | PaymentService | order.payment_status = PAID after payment |

### 1.3 User Stories Covered

| User Story | Service(s) | Test Coverage |
|------------|------------|---------------|
| **US-01** Record Laundry Order | OrderService | create with valid data, reference number, initial status |
| **US-02** Automatically Compute Laundry Price | OrderService | pricing formulas (loads, base, extra minutes, add-ons) |
| **US-03** Update Laundry Order Status | OrderStatusService | valid transitions, release precondition |
| **US-06** Record Payment | PaymentService | amount validation, one payment per order |

### 1.4 Test Types

| Type | Scope | Rationale |
|------|-------|------------|
| **Unit Tests** | All 5 services | Business rules enforced in-memory with mocked repositories. Fast, deterministic. |
| **Integration Tests** | None for Phase 5 | Service logic does not require DB for rule validation. Repository ITs (Phase 4) already verify uniqueness constraints. Transactional behavior is standard Spring. |

### 1.5 Explicitly Out-of-Scope for Phase 5 Tests

- **Controllers** — Not tested (Phase 6 API layer)
- **Repositories** — Already tested in Phase 4 (OrderRepositoryIT, PaymentRepositoryIT, etc.)
- **Partial payments, overpayments** — MVP excludes these (BR-PAY-03)
- **BR-OL-04 full transition sequence** — Recommended for MVP+; current implementation allows any valid status change except same-status and release-from-non-ready
- **BR-NOTIF-01** — Phase 10 (Notifications)

---

## 2. Test Matrix

| Requirement | Service Method | Test Case Name | Type | Expected Result | Notes |
|-------------|----------------|----------------|------|-----------------|-------|
| US-01, BR-OL-01, BR-OL-02 | OrderService.create | create_ShouldPersistOrder_WhenValidCommand | Unit | Order saved, reference unique, status RECEIVED | Happy path |
| BR-PR-02 | OrderService.create | create_ShouldComputeTotalLoads_CeilWeightOver8 | Unit | total_loads = ceil(weight/8) | 8kg=1, 8.01kg=2, 16kg=2 |
| BR-PR-01 | OrderService.create | create_ShouldComputeBaseAmount_FromLoadsAndRate | Unit | base_amount = loads × 120 | |
| BR-PR-03 | OrderService.create | create_ShouldComputeExtraMinutesAmount_WhenExtraMinutesGiven | Unit | extra_minutes_amount = extra × 1 | 0 extra = 0 |
| BR-PR-04 | OrderService.create | create_ShouldIncludeAddOnsInGrandTotal | Unit | grand_total includes add-ons | |
| BR-PR-01 | OrderService.create | create_ShouldReject_WhenWeightNullOrZeroOrNegative | Unit | IllegalArgumentException | |
| US-01 | OrderService.create | create_ShouldThrow_WhenCustomerNotFound | Unit | NotFoundException | |
| US-01 | OrderService.create | create_ShouldThrow_WhenUserNotFound | Unit | NotFoundException | |
| US-03, BR-OL-03 | OrderStatusService.updateStatus | updateStatus_ShouldSucceed_WhenValidTransition | Unit | Order updated, log created | RECEIVED→WASHING |
| BR-OL-05 | OrderStatusService.updateStatus | updateStatus_ShouldRejectRelease_WhenNotReadyForPickup | Unit | IllegalStateException | |
| BR-OL-03 | OrderStatusService.updateStatus | updateStatus_ShouldReject_WhenInvalidStatus | Unit | IllegalArgumentException | null, invalid enum |
| BR-OL-04 | OrderStatusService.updateStatus | updateStatus_ShouldReject_WhenSameStatus | Unit | IllegalArgumentException | |
| US-03 | OrderStatusService.updateStatus | updateStatus_ShouldThrow_WhenOrderNotFound | Unit | NotFoundException | |
| US-06, BR-PAY-03 | PaymentService.create | create_ShouldSucceed_WhenAmountMatchesGrandTotal | Unit | Payment saved, order PAID | |
| BR-PAY-02 | PaymentService.create | create_ShouldThrowConflict_WhenPaymentAlreadyExists | Unit | ConflictException | |
| BR-PAY-03 | PaymentService.create | create_ShouldThrow_WhenAmountMismatch | Unit | IllegalArgumentException | |
| US-06 | PaymentService.create | create_ShouldThrow_WhenOrderNotFound | Unit | NotFoundException | |
| CustomerService | CustomerService.create | create_ShouldPersist_WhenNewCustomer | Unit | Customer saved | |
| CustomerService | CustomerService.create | create_ShouldThrow_WhenDuplicateIdentity | Unit | IllegalArgumentException | |
| CustomerService | CustomerService.search | search_ShouldReturnEmpty_WhenBlankQuery | Unit | List.of() | |
| ServiceRateService | ServiceRateService.getActiveRate | getActiveRate_ShouldReturn_WhenActiveExists | Unit | ServiceRate returned | |
| ServiceRateService | ServiceRateService.getActiveRate | getActiveRate_ShouldThrow_WhenNoActiveRate | Unit | NotFoundException | |

---

## 3. Test Data Strategy

See `TestDataBuilders` class in `src/test/java/com/himotech/laundryms/support/TestDataBuilders.java`.

- **Customer** — Builder with firstName, lastName, contactNumber
- **User** — Builder with id (UUID), username, role
- **ServiceRate** — Builder with base 120, kg 8, extra 1, isActive true
- **Order** — Builder with all pricing snapshot fields
- **CreateOrderCommand** — Factory methods for common scenarios
- **RecordPaymentCommand** — Factory with orderId, amount, method, userId

---

## 4. How to Run + Expected Output

### Maven Commands

```bash
# Run all tests
cd backend
.\mvnw.cmd test

# Run only Phase 5 service unit tests
.\mvnw.cmd test -Dtest="*ServiceTest"

# Run with coverage (if jacoco configured)
.\mvnw.cmd test jacoco:report
```

### Environment / Config

- **application-test.yml** — Used automatically when `@ActiveProfiles("test")` is present
- **Unit tests** — No database; use `@ExtendWith(MockitoExtension.class)`
- **Integration tests** — Testcontainers PostgreSQL 16 (existing Phase 4 tests)

### Expected Success Indicators

- All `*ServiceTest` classes pass
- No `NullPointerException` (repositories properly mocked)
- `.\mvnw.cmd test` exits with code 0
- Service layer coverage > 80% (per Phase 5 Definition of Done)

---

## 5. Learning Notes (Per Rule)

### BR-PR-02 — total_loads = ceil(weight_kg / 8)

**Why this test exists:** Ensures exact multiples of 8 kg (e.g., 8.00) use 1 load, while 8.01 kg uses 2 loads. Common bug: using `floor` or `round` instead of `ceil`.

**What bug it prevents:** Undercharging when weight slightly exceeds a load boundary.

### BR-PAY-03 — Payment amount must equal grand total

**Why this test exists:** MVP requires full payment only. Partial or overpayment would corrupt reporting.

**What bug it prevents:** Recording wrong amounts, inconsistent order totals vs. payment records.

### BR-PAY-02 — One payment per order

**Why this test exists:** Database has unique constraint on `payments.order_id`; service must check before insert to give a clear ConflictException.

**What bug it prevents:** Duplicate payment records, double-counting in reports.

### BR-OL-05 — Release only from READY_FOR_PICKUP

**Why this test exists:** Staff must verify laundry before release. Skipping to RELEASED from WASHING would bypass verification.

**What bug it prevents:** Releasing orders before they are ready, customer complaints.

### BR-OL-01 — Unique reference number

**Why this test exists:** Reference is used for public tracking. Duplicates would confuse customers.

**What bug it prevents:** Collision in reference lookup, wrong order displayed to customer.

---

## 6. Optional Refactor for Testability

### OrderService — Reference Number Generation

**Issue:** `generateUniqueReferenceNumber()` uses `LocalDate.now()` and `new Random()`, making deterministic tests harder.

**Minimal refactor:** Inject a `Supplier<String>` for reference generation in tests:

```java
// In OrderService: add optional ReferenceNumberGenerator
// In tests: inject () -> "LDR-20260213-1234" for deterministic ref
```

**Recommendation:** For MVP, the current implementation is acceptable. Tests can stub `orderRepository.existsByReferenceNumber(ref)` to return false for any ref, so the actual generated value is not asserted. The important assertion is that a unique ref is produced and used.
