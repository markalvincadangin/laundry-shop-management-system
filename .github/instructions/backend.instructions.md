---
applyTo: "backend/**"
---

# Backend Instructions — Spring Boot 3.3+
## Faith Laundry Shop Management System

> **Context:** Java-based REST API for laundry order management, pricing automation, and sales reporting  
> **Stack:** Java 21 LTS, Spring Boot 3.3+, Maven, PostgreSQL 16, Flyway, Testcontainers

---

## Tech Stack (Mandatory)

- **Java 21 (LTS)** - Language version
- **Spring Boot 3.3+** - Framework
- **Maven** - Build tool (NO Gradle)
- **PostgreSQL 16** - Database with `pgcrypto` extension
- **Flyway** - Database migrations
- **JUnit 5 + Testcontainers** - Testing framework

---

## Architecture Layers (Strict Separation)

### Controller Layer
**Responsibilities:**
- HTTP request/response handling only
- Route to service methods
- Return DTOs (never entities)
- Use `@RestController`, `@RequestMapping`

**Rules:**
- NO business logic
- NO direct repository access
- Keep methods thin (< 10 lines)
- Align exactly with `/docs/05-tech-design/openapi.yaml`
- Use global exception handler for errors

**Example:**
```java
@PostMapping("/api/orders")
public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody CreateOrderRequestDTO request) {
    OrderResponseDTO order = orderService.createOrder(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(order);
}
```

### Service Layer
**Responsibilities:**
- ALL business rule enforcement (pricing, status transitions, validation)
- Transaction management (`@Transactional`)
- Business logic orchestration
- Logging key events

**Rules:**
- Enforce business rules from `/docs/02-requirements/business-rules.md`
- Use `@Service` annotation
- Return DTOs, map from entities
- Throw business exceptions (not HTTP exceptions)
- Log: order creation, status changes, payment recording

**Key Services:**

**OrderService:**
- Generate unique `reference_number`
- Load active service rate (`service_rates.is_active = true`)
- Compute `total_loads = ceil(weight_kg / kg_limit_per_load)`
- Compute financial amounts:
  - `base_amount = total_loads × base_price_per_load`
  - `extra_minutes_amount = extra_minutes × price_per_extra_minute`
  - `addons_total_amount = sum(order_add_ons)`
  - `grand_total = base_amount + extra_minutes_amount + addons_total_amount`
- Snapshot pricing rates at order creation
- Set `current_status = RECEIVED`, `payment_status = UNPAID`
- Validate: `weight_kg > 0`, `extra_minutes >= 0`

**OrderStatusService:**
- Validate status transitions (BR-OL-04)
- Allowed flow: RECEIVED → WASHING → DRYING → FOLDING → READY_FOR_PICKUP → RELEASED
- Allow CANCELLED from any non-terminal status before RELEASED
- Insert `order_status_logs` record with user and timestamp
- Update `orders.current_status`
- Enforce: can only RELEASE if the status is READY_FOR_PICKUP (BR-OL-05)

**PaymentService:**
- Enforce a one-to-one relationship (one payment per order - BR-PAY-02)
- Validate `amount_paid == order.grand_total` (BR-PAY-03)
- Check payment doesn't already exist for order
- Insert payment record
- Update `orders.payment_status = PAID`
- Link to `received_by_user_id`

**ReportService:**
- Aggregate payments by date range
- Daily/monthly/yearly totals
- Return only paid orders
- Owner-only access

### Repository Layer
**Responsibilities:**
- JPA persistence operations only
- Custom queries using `@Query` or derived methods

**Rules:**
- Extend `JpaRepository<Entity, ID>`
- NO business logic
- Use for CRUD and queries only
- Custom methods: `findByReferenceNumber`, `findByCustomerId`, etc.

**Required Repositories:**
- `UserRepository`
- `CustomerRepository`
- `ServiceRateRepository`
- `OrderRepository`
- `OrderAddOnRepository`
- `OrderStatusLogRepository`
- `PaymentRepository`
- `NotificationRepository`

---

## Data Model & Schema Rules

### Database Schema
**Source of Truth:** `/docs/04-data-design/erd.dbml`

**Entities Must Match ERD Exactly:**

**Users:**
- `id` (UUID, `gen_random_uuid()`)
- `username` (unique, not null)
- `password_hash` (not null)
- `role` (user_role enum: OWNER, STAFF)
- `first_name`, `last_name` (not null)
- `is_active` (boolean, default true)
- Timestamps: `created_at`, `updated_at`

**Customers:**
- `id` (bigserial)
- `first_name`, `last_name`, `contact_number` (not null)
- Unique constraint: `(last_name, first_name, contact_number)`
- Timestamps: `created_at`, `updated_at`

**Service Rates:**
- `id` (int, auto-increment)
- `service_name` (default: 'Standard Wash')
- `base_price_per_load` (decimal, default: 120.00)
- `kg_limit_per_load` (decimal, default: 8.00)
- `price_per_extra_minute` (decimal, default: 1.00)
- `is_active` (boolean, default true)

**Orders:**
- `id` (bigserial)
- `reference_number` (unique, not null)
- `customer_id` (FK to customers)
- `created_by_user_id` (FK to users)
- `service_rate_id` (FK to service_rates)
- `weight_kg` (decimal, not null)
- `total_loads` (int, not null)
- Pricing snapshots: `base_price_per_load`, `kg_limit_per_load`, `price_per_extra_minute`
- `extra_minutes` (int, default 0)
- Computed amounts: `base_amount`, `extra_minutes_amount`, `addons_total_amount`, `grand_total`
- `current_status` (order_status enum, default RECEIVED)
- `payment_status` (payment_status enum, default UNPAID)
- Timestamps: `created_at`, `updated_at`

**Order Add-Ons:**
- `id` (bigserial)
- `order_id` (FK to orders)
- `name` (e.g., 'Extra Fabric Conditioner')
- `price` (decimal)
- `quantity` (int, default 1)

**Order Status Logs:**
- `id` (bigserial)
- `order_id` (FK to orders)
- `previous_status`, `new_status` (order_status enum)
- `changed_by_user_id` (FK to users)
- `changed_at` (timestamp)
- `notes` (text, optional)

**Payments:**
- `id` (bigserial)
- `order_id` (FK to orders, **unique** - one-to-one)
- `amount_paid` (decimal, not null)
- `payment_method` (payment_method enum)
- `received_by_user_id` (FK to users)
- `payment_date` (timestamp)
- `remarks` (text, optional)

**Notifications:**
- `id` (bigserial)
- `order_id`, `customer_id` (FKs)
- `message` (text)
- `created_at`, `sent_at` (timestamps)
- `status` (notification_status enum: PENDING, SENT, FAILED)

### Enums (PostgreSQL Native)
```sql
CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');
CREATE TYPE order_status AS ENUM ('RECEIVED', 'WASHING', 'DRYING', 'FOLDING', 'READY_FOR_PICKUP', 'RELEASED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'PARTIAL');
CREATE TYPE payment_method AS ENUM ('CASH', 'GCASH', 'BANK_TRANSFER');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');
```

### Flyway Migrations
**Location:** `backend/src/main/resources/db/migration`

**Rules:**
- Naming: `V1__init.sql`, `V2__seed_users.sql`, `V3__description.sql`
- **NEVER** edit existing migrations after merge
- Use PostgreSQL syntax only
- Enable `pgcrypto` extension in V1: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- Create enums before tables
- Add indexes for: `reference_number`, customer composite key, `payment.order_id`

**V1__init.sql must include:**
- Extension: `pgcrypto`
- All enums
- All tables with constraints
- Unique constraints: `orders.reference_number`, `payments.order_id`
- Foreign keys with appropriate cascade rules

**V2__seed_users.sql:**
- Seed default owner account
- Hash passwords using BCrypt
- Example: username='admin', role='OWNER'

---

## Business Rules Implementation (BR-*)

### Pricing Rules (BR-PR-01 to BR-PR-04)

**BR-PR-01: Base Load Pricing**
```java
// ₱120 per load up to 8kg
BigDecimal basePricePerLoad = serviceRate.getBasePricePerLoad(); // 120.00
BigDecimal kgLimitPerLoad = serviceRate.getKgLimitPerLoad(); // 8.00
```

**BR-PR-02: Load Calculation**
```java
// total_loads = ceil(weight_kg / kg_limit_per_load)
int totalLoads = (int) Math.ceil(weightKg.divide(kgLimitPerLoad, 10, RoundingMode.HALF_UP).doubleValue());
```

**BR-PR-03: Extra Washing Time**
```java
// First 45 minutes included; charge ₱1 per extra minute
BigDecimal extraMinutesAmount = BigDecimal.valueOf(extraMinutes)
    .multiply(serviceRate.getPricePerExtraMinute());
```

**BR-PR-04: Add-ons**
```java
// Sum of all order_add_ons
BigDecimal addonsTotal = orderAddOns.stream()
    .map(addon -> addon.getPrice().multiply(BigDecimal.valueOf(addon.getQuantity())))
    .reduce(BigDecimal.ZERO, BigDecimal::add);
```

**Grand Total Computation:**
```java
BigDecimal baseAmount = basePricePerLoad.multiply(BigDecimal.valueOf(totalLoads));
BigDecimal grandTotal = baseAmount.add(extraMinutesAmount).add(addonsTotal);
```

### Order Lifecycle Rules (BR-OL-01 to BR-OL-05)

**BR-OL-01: Unique Reference Number**
```java
// Generate unique reference (e.g., "LDR-20260210-001")
String referenceNumber = generateReferenceNumber();
if (orderRepository.existsByReferenceNumber(referenceNumber)) {
    throw new DuplicateReferenceException("Reference already exists");
}
```

**BR-OL-02: Initial Status**
```java
order.setCurrentStatus(OrderStatus.RECEIVED);
order.setPaymentStatus(PaymentStatus.UNPAID);
```

**BR-OL-03: Status Validation**
```java
if (!OrderStatus.isValid(newStatus)) {
    throw new InvalidStatusException("Invalid status: " + newStatus);
}
```

**BR-OL-04: Status Transitions**
```java
// Validate allowed transitions
if (!isTransitionAllowed(currentStatus, newStatus)) {
    throw new IllegalStatusTransitionException(
        "Cannot transition from " + currentStatus + " to " + newStatus
    );
}
```

**BR-OL-05: Release Preconditions**
```java
if (newStatus == OrderStatus.RELEASED && 
    order.getCurrentStatus() != OrderStatus.READY_FOR_PICKUP) {
    throw new IllegalStateException("Order must be READY_FOR_PICKUP before release");
}
```

### Payment Rules (BR-PAY-01 to BR-PAY-04)

**BR-PAY-02: One Payment Per Order**
```java
if (paymentRepository.existsByOrderId(orderId)) {
    throw new PaymentAlreadyExistsException("Payment already recorded for this order");
}
```

**BR-PAY-03: Amount Validation**
```java
if (amountPaid.compareTo(order.getGrandTotal()) != 0) {
    throw new PaymentAmountMismatchException(
        "Payment amount must match order total: " + order.getGrandTotal()
    );
}
```

**BR-PAY-04: Update Payment Status**
```java
order.setPaymentStatus(PaymentStatus.PAID);
orderRepository.save(order);
```

---

## Validation Rules

### Bean Validation
Use `@Valid` and constraint annotations:

```java
@NotNull(message = "Weight is required")
@DecimalMin(value = "0.1", message = "Weight must be greater than 0")
private BigDecimal weightKg;

@Min(value = 0, message = "Extra minutes cannot be negative")
private Integer extraMinutes;

@NotBlank(message = "Customer name is required")
private String customerName;

@Pattern(regexp = "^[0-9]{10,11}$", message = "Invalid contact number")
private String contactNumber;
```

### Custom Validation
- Reference number format validation
- Status transition validation
- Payment amount vs order total
- Active service rate existence

---

## Testing Standards

### Unit Tests (Services)
**Target:** Business logic, pricing, status transitions

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private ServiceRateRepository serviceRateRepository;
    
    @InjectMocks
    private OrderService orderService;
    
    @Test
    void shouldComputeCorrectTotalLoads() {
        // Test ceil(8.1 / 8) = 2 loads
        // Test ceil(16.0 / 8) = 2 loads
        // Test ceil(16.1 / 8) = 3 loads
    }
    
    @Test
    void shouldEnforcePaymentAmountMatchesTotal() {
        // BR-PAY-03 validation
    }
}
```

### Integration Tests (Repositories & API)
**Target:** Database operations, end-to-end flows

```java
@SpringBootTest
@Testcontainers
class OrderRepositoryIT {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Test
    void shouldEnforceUniqueReferenceNumber() {
        // Test unique constraint on reference_number
    }
    
    @Test
    void shouldCascadeDeleteOrderAddOns() {
        // Test relationship cascade
    }
}
```

**Testcontainers Configuration:**
- Use PostgreSQL 16 image
- Enable `pgcrypto` extension
- Run Flyway migrations before tests
- Use `application-test.yml` for test properties

**Test Coverage Requirements:**
- All business rules (BR-*) must have tests
- All pricing computations
- All status transitions
- Payment validation
- Repository constraints

---

## Error Handling

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(ex.getMessage()));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleConflict(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```

### HTTP Status Codes
- **200 OK** - Success
- **201 Created** - Resource created
- **400 Bad Request** - Validation or business rule violation
- **404 Not Found** - Resource not found (order, customer, etc.)
- **409 Conflict** - Uniqueness violations (duplicate reference, payment exists)

### Error Response Schema
Follow OpenAPI `ErrorResponse` schema:
```java
{
    "message": "Payment amount must match order total",
    "timestamp": "2026-02-10T10:30:00Z",
    "path": "/api/payments"
}
```

---

## Security & Access Control

### Role-Based Access
```java
@PreAuthorize("hasRole('OWNER')")
@GetMapping("/api/reports/daily")
public ReportDTO getDailyReport(@RequestParam LocalDate date) {
    return reportService.getDailyReport(date);
}

@PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
@PostMapping("/api/orders")
public OrderResponseDTO createOrder(@Valid @RequestBody CreateOrderRequestDTO request) {
    return orderService.createOrder(request);
}
```

**Access Rules:**
- **OWNER:** All operations + reports + rates management
- **STAFF:** Orders, status updates, payments, customers (NO reports)
- **Public:** Order tracking by reference number (limited data)

### Authentication
- Use Spring Security
- BCrypt password hashing
- JWT or session-based authentication
- Seed admin account in Flyway migration

---

## API Contract Alignment

**Source:** `/docs/05-tech-design/openapi.yaml`

**Rules:**
- Match endpoints exactly (path, method, parameters)
- Use exact DTO field names from schemas
- Return correct HTTP status codes
- Follow error response schema
- Document all endpoints in OpenAPI first

**Example Alignment:**
```java
// OpenAPI: POST /api/orders
// Request: CreateOrderRequest schema
// Response: 201 Created, OrderResponse schema
@PostMapping("/api/orders")
public ResponseEntity<OrderResponseDTO> createOrder(
    @Valid @RequestBody CreateOrderRequestDTO request) {
    // Implementation
}
```

---

## Logging & Observability

### Structured Logging
```java
@Slf4j
@Service
public class OrderService {
    public OrderResponseDTO createOrder(CreateOrderRequestDTO request) {
        log.info("Creating order for customer: {}, weight: {}kg", 
            request.getCustomerId(), request.getWeightKg());
        
        // Business logic
        
        log.info("Order created successfully. Reference: {}, Total: ₱{}", 
            order.getReferenceNumber(), order.getGrandTotal());
        
        return orderMapper.toDTO(order);
    }
}
```

**Log Key Events:**
- Order creation (reference number, customer, total)
- Status changes (old status → new status, user)
- Payment recording (order reference, amount, method)
- Errors and exceptions

---

## Configuration

### application.yml
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5433/laundry_db}
    username: ${DB_USERNAME:laundry_user}
    password: ${DB_PASSWORD:laundry_pass}
  jpa:
    hibernate:
      ddl-auto: validate # Never 'update' or 'create-drop' in production
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### application-test.yml
```yaml
spring:
  datasource:
    # Testcontainers will override these
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    enabled: true
```

---

## Package Structure

```
com.himotech.laundryms/
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   └── dto/
├── users/
│   ├── User.java
│   ├── UserRepository.java
│   └── UserService.java
├── customers/
│   ├── Customer.java
│   ├── CustomerRepository.java
│   ├── CustomerService.java
│   └── dto/
├── rates/
│   ├── ServiceRate.java
│   ├── ServiceRateRepository.java
│   └── ServiceRateService.java
├── orders/
│   ├── Order.java
│   ├── OrderRepository.java
│   ├── OrderService.java
│   ├── OrderAddOn.java
│   └── dto/
├── orderstatus/
│   ├── OrderStatusLog.java
│   ├── OrderStatusLogRepository.java
│   └── OrderStatusService.java
├── payments/
│   ├── Payment.java
│   ├── PaymentRepository.java
│   ├── PaymentService.java
│   └── dto/
├── reports/
│   ├── ReportController.java
│   └── ReportService.java
├── notifications/ (optional MVP)
│   ├── Notification.java
│   ├── NotificationRepository.java
│   └── NotificationService.java
└── common/
    ├── exception/
    │   └── GlobalExceptionHandler.java
    └── config/
        └── SecurityConfig.java
```

---

## Development Checklist

Before submitting PR:
- [ ] All entities match ERD schema
- [ ] Business rules enforced in service layer
- [ ] Controllers are thin (< 10 lines per method)
- [ ] DTOs used (no entity exposure)
- [ ] Bean validation applied
- [ ] Unit tests for services
- [ ] Integration tests with Testcontainers
- [ ] APIs match OpenAPI contract
- [ ] Error handling consistent
- [ ] Logging for key events
- [ ] No hardcoded values (use service_rates table)
- [ ] Flyway migrations tested
- [ ] `.\mvnw.cmd test` passes
