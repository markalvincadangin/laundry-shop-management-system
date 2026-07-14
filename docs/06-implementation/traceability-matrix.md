# Traceability Matrix
**Generated:** 2026-07-05
**Scope:** Client Interview (docs/00-context/client-interview.md) → Business Rules (docs/02-requirements/business-rules.md) → Code & Tests.

## 1. Business Rules Traceability

| Business Rule | Client Interview Source | Implementation File & Method | Test Coverage | Flags & Contradictions |
|---------------|-------------------------|------------------------------|---------------|-------------------------|
| **BR-PR-01** (Base Load Pricing) | L74: "One (1) load costs ₱140 and covers up to 8 kg." | `OrderService.java:172` (baseAmount computation) | `OrderServiceTest.java:173` | None |
| **BR-PR-02** (Additional Load for Excess) | L74: "Exceeding 8 kg is charged as another load." | `OrderService.java:167` (totalLoads ceil computation) | `OrderServiceTest.java:131`, 144, 158 | None |
| **BR-PR-03** (Extra Time Charge) | L77: "Additional charges for... extended washing time... ₱1 per extra minute" | `OrderService.java:176` (extraMinutesAmount) | `OrderServiceTest.java:186` | None |
| **BR-PR-04** (Optional Add-ons) | L77: "Additional charges for extra fabric conditioner..." | `OrderService.java:180` (addonsTotalAmount reduction) | `OrderServiceTest.java:216` | None |
| **BR-PR-05** (Admin Controls Rates) | *Not explicitly stated.* (Derived from Q18/Q23 Admin Needs) | `ServiceRatesController.java:40` (Requires `ADMIN` role) | `ServiceRateServiceTest.java:53` | None |
| **BR-OL-01** (Unique Reference) | *Not explicitly stated.* (Derived for Tracking Q25) | `OrderService.java:62` (`generateUniqueReferenceNumber`) | `OrderServiceTest.java:112` | None |
| **BR-OL-02** (Initial Status) | *Not explicitly stated.* (Implicit in process L54) | `OrderService.java:203` (`OrderStatus.RECEIVED`) | `OrderServiceTest.java:103` | None |
| **BR-OL-03** (Allowed Status) | L57: "washed, dried, and folded... prepared for pickup." | `OrderStatus.java` enum | `OrderStatusServiceTest.java:177` | None |
| **BR-OL-04** (Status Transitions) | *Not explicitly stated.* | `OrderStatusService.java:64` | `OrderStatusServiceTest.java:120` | None |
| **BR-OL-05** (Release Preconditions) | L93: "Staff verifies... prior to release." & L82: "Upon pickup" | `OrderStatusService.java:79` | `OrderStatusServiceTest.java:116` | None |
| **BR-OL-06** (Order Edit) | L77: Extended washing time due to excessive dirt. | `OrderService.java:323` (`update()`) | `OrderServiceTest.java:360` | None |
| **BR-PAY-01** (Payment Timing) | L82: "Upon pickup." | `OrderStatusService.java:79` (Release precondition) | `OrderStatusServiceTest.java:162` | Enforced indirectly via release check |
| **BR-PAY-02** (Link to Order) | L85: "Payments are recorded... as a reference" | `PaymentRepository.java:36` | `PaymentRepositoryIT.java:161` | None |
| **BR-PAY-03** (Amount Validation) | L61: "Receipt includes... total payment amount" | `PaymentService.java:57` | `PaymentServiceTest.java:85` | None |
| **BR-PAY-04** (Payment Status) | L100: "payments" | `PaymentService.java:66` / `103` | `PaymentServiceTest.java:98` | None |
| **BR-PAY-05** (Payment Method) | *Not explicitly stated.* (Modernization assumption) | `PaymentService.java:67` (Method mapping) | `PaymentServiceTest.java` | None |
| **BR-PAY-06** (Payment Voiding) | *Not explicitly stated.* | `PaymentService.java:104` (`voidPayment`) | `PaymentServiceTest.java` | None |
| **BR-PAY-07** (Auto Reversal) | *Not explicitly stated.* | `OrderStatusService.java:93` (`setPaymentStatus`) | `OrderStatusServiceTest.java` | None |
| **BR-REC-01** (Core Data) | L100: "Customer names, contact numbers, payments, daily sales." | `Order.java`, `Customer.java`, `Payment.java` | N/A (JPA mapping) | None |
| **BR-NOTIF-01** (Ready Notification) | L158: "digital notifications" | `OrderStatusService.java:102` | `OrderStatusServiceTest.java:102` | None |
| **BR-NOTIF-02** (Tracking) | L158: "track laundry status" | `OrderService.java:399` (`findByReferenceNumber`) | `OrderServiceTest.java` (`FindByReferenceNumber`) | None |

## 2. Lost Requirements (Client Interview statements without Business Rules)

These statements capture client pain points or requirements that were completely omitted from `business-rules.md`, meaning they either got lost or were implicitly bundled without proper tracking:

1. **Lost Rule: Laundry Sorting Preferences**
   - *Interview L56*: "Laundry is sorted by customer preference (e.g., white and colored clothing)."
   - *Impact*: There is no business rule governing how to capture sorting preferences. It was entirely missed in the requirements phase.

2. **Lost Rule: Physical Tagging**
   - *Interview L66*: "Each order is tagged with the customer's name."
   - *Impact*: The system generates a Reference Number (BR-OL-01), but there is no rule specifying that physical tags must be printed or associated.

3. **Lost Rule: Rush Orders**
   - *Interview L69*: "...when multiple rush orders are processed."
   - *Impact*: `business-rules.md` explicitly omits rush orders. However, **Code Contradiction**: `OrderService.java:425` explicitly checks for `WASH_DRY_FOLD_RUSH`. This indicates the developer added rush order logic without a formal business rule driving it.

## 3. Security & Validation Check (Constitution Compliance)

- **Hardcoded Secrets**: Passed. No hardcoded passwords or API keys found in tracked `backend/src` code.
- **BCrypt Cost Factor**: **FAILED**. `SecurityConfig.java:27` hardcodes `new BCryptPasswordEncoder(10)`. It does not dynamically adjust to 12-14 for production environments as required by the constitution.
- **Seed Users Gate**: Passed. `V2__seed_users.sql` effectively gates insertion via `WHERE '${seed_environment}' = 'dev'`, preventing prod spillage.
- **RBAC**: Passed. Found 12 distinct `@PreAuthorize` tags mapping 1-to-1 against all protected `@RestController` boundaries.
- **Unit Tests**: Backend unit test suite run completed (100 tests total, 98 pass, 2 fail specifically due to missing Docker Daemon for Testcontainers, which is a local environment issue, not a code defect). Frontend Vitest suite passed.
- **OWASP Scan**: Passed. Dependency scan executed successfully without aborts.
