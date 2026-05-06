---
applyTo: "backend/**"
---

# Backend Instructions — Spring Boot 3.5
## Faith Laundry Shop Management System

> **Context:** Java REST API for laundry order management, pricing, and reporting  
> **Stack:** Java 21, Spring Boot 3.5.10, Maven, PostgreSQL 16, Flyway, Testcontainers  
> **Full context:** See `CLAUDE.md` at project root

---

## Tech Stack (Mandatory)

| Layer | Technology |
|-------|-----------|
| Language | Java 21 LTS |
| Framework | Spring Boot **3.5.10** (NOT 3.3) |
| Build | Maven (`./mvnw -B -ntp verify`) |
| Database | PostgreSQL 16 |
| Migrations | Flyway (never edit existing migrations after merge) |
| DTO Mapping | MapStruct 1.5.5 |
| Code Gen | Lombok |
| Auth | Spring Security + JJWT 0.12.6 (HTTP-only cookie) |
| Testing | JUnit 5, Mockito, Spring Boot Test, Testcontainers |
| Config | spring-dotenv + dotenv-java (`.env` files) |

---

## Architecture Layers (Strict)

```
Controller  ← HTTP only. Thin. No logic. Delegates to Service.
    ↓
Service     ← ALL business rules. @Transactional. Returns DTOs.
    ↓
Repository  ← JPA/persistence only. No business logic.
```

### Package Structure
```
com.himotech.laundryms/
├── api/              # Shared: DTOs (request/response), OrderMapper
├── auth/             # JWT, AuthController, AuthService
├── auditlog/         # @Auditable AOP + ActivityLog entity
├── clientalert/      # Client notification log
├── common/           # Shared: NotFoundException, PageResponse
├── config/           # SecurityConfig, WebConfig, JacksonConfig
├── customers/        # Customer entity, service, controller
├── health/           # GET /api/v1/health
├── orders/           # Core: entity, service, controller, specs, command
├── payments/         # Payment entity, service, controller, repository
├── rates/            # ServiceRate entity, service, controller
├── reports/          # Revenue aggregation, ReportsController
├── security/         # JwtFilter, CustomUserDetailsService
└── users/            # User management
```

---

## Critical Implementation Rules

### ⚠️ MapStruct — MUST keep `disableBuilder = true`
```java
// OrderMapper.java — DO NOT REMOVE disableBuilder
@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface OrderMapper { ... }
```
**Reason:** MapStruct's builder inference collides with Lombok's `addOns` builder method naming. Removing this breaks compilation.

### ⚠️ Null-safe auth check in OrderService
```java
// OrderService.java — always null-check authentication
var auth = SecurityContextHolder.getContext().getAuthentication();
boolean isAdmin = auth != null && auth.getAuthorities().stream()
    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
```
**Reason:** `getAuthentication()` returns null in unit test and scheduled task contexts.

### ⚠️ COALESCE in PaymentRepository
```java
@Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p WHERE ...")
BigDecimal sumAmountPaidByPaymentDateBetween(...);
```
**Reason:** Raw `SUM()` returns null for empty periods, breaking revenue reports.

### ⚠️ Enums stored as `varchar`
```java
@Enumerated(EnumType.STRING) // Always STRING, never ORDINAL
private OrderStatus currentStatus;
```
**Reason:** ERD uses `varchar` for all enums. Native PG enums cause JPA casting issues.

---

## Data Model — Source of Truth: `docs/04-data-design/erd.dbml`

### Key Enums (varchar — exact values)
| Enum | Values |
|------|--------|
| `order_status` | `RECEIVED, WASHING, DRYING, FOLDING, READY_FOR_PICKUP, RELEASED, CANCELLED` |
| `payment_status` | `UNPAID, PAID, VOIDED` |
| `payment_method` | `CASH, GCASH, BANK_TRANSFER` |
| `user_role` | `ADMIN, STAFF` (NOT `OWNER`) |

### Orders Table (key fields)
- `reference_number` — unique, format `LDR-YYYYMMDD-XXXX`
- `service_rate_id` — FK to `service_rates` (pricing snapshot)
- `base_price_per_load`, `kg_limit_per_load`, `price_per_extra_minute` — snapshot at creation
- `total_loads`, `base_amount`, `extra_minutes_amount`, `addons_total_amount`, `grand_total` — computed
- `current_status` (default: `RECEIVED`), `payment_status` (default: `UNPAID`)
- `notes` — varchar(500), nullable (special instructions)
- `service_type` — the service name identifier (`STANDARD`, `WASH_DRY_FOLD_RUSH`, `BLANKETS`)

---

## Business Rules — `docs/02-requirements/business-rules.md`

### Pricing (BR-PR-*)
```java
// BR-PR-01: ₱140 per load (NOT ₱120 — rate is configurable via service_rates)
// BR-PR-02: total_loads = ceil(weight_kg / kg_limit_per_load)
int totalLoads = weightKg.divide(rate.getKgLimitPerLoad(), 10, RoundingMode.HALF_UP)
                         .setScale(0, RoundingMode.CEILING).intValue();

// BR-PR-03: extra_minutes_amount = extra_minutes × price_per_extra_minute
BigDecimal extraMinutesAmount = BigDecimal.valueOf(extraMinutes)
    .multiply(rate.getPricePerExtraMinute());

// BR-PR-04: addons_total = sum(price × quantity)
BigDecimal addonsTotal = addOns.stream()
    .map(a -> a.getPrice().multiply(BigDecimal.valueOf(a.getQuantity())))
    .reduce(BigDecimal.ZERO, BigDecimal::add);

// Grand total
BigDecimal grandTotal = baseAmount.add(extraMinutesAmount).add(addonsTotal);
```

### Order Lifecycle (BR-OL-*)
- **BR-OL-02:** New order → `RECEIVED`, `UNPAID`
- **BR-OL-04:** Transitions: `RECEIVED→WASHING→DRYING→FOLDING→READY_FOR_PICKUP→RELEASED`. `CANCELLED` from any non-terminal.
- **BR-OL-05:** Release only if `READY_FOR_PICKUP` AND `PAID`
- **BR-OL-06:** Edit (extra minutes / add-ons) only if `UNPAID` AND not `RELEASED`

### Payments (BR-PAY-*)
- **BR-PAY-02:** One payment per order (`unique` constraint on `payments.order_id`)
- **BR-PAY-03:** `amountPaid` must exactly equal `order.grandTotal`
- **BR-PAY-07:** Cancelling a paid order auto-sets `paymentStatus = VOIDED`

### Service Types
```java
// OrderService.resolveRate() — maps frontend serviceType to DB service_name
private ServiceRate resolveRate(String serviceType) {
    if (serviceType == null) return serviceRateService.getActiveRate();
    String dbName = switch (serviceType) {
        case "WASH_DRY_FOLD_RUSH" -> "Rush Wash";
        case "BLANKETS"           -> "Blankets";
        default                   -> "Standard Wash";
    };
    return serviceRateService.getByName(dbName);
}
```

---

## Testing Standards

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository orderRepository;
    @Mock ServiceRateService serviceRateService;
    @InjectMocks OrderService orderService;
    
    @BeforeEach void setUp() {
        // Mock getActiveRate() — use null serviceType in TestDataBuilders
        when(serviceRateService.getActiveRate()).thenReturn(
            TestDataBuilders.serviceRate(new BigDecimal("140.00"), 
                                        new BigDecimal("8.00"), 
                                        new BigDecimal("1.00")));
    }
}
```

### TestDataBuilders — Important Rules
```java
// ALWAYS use null serviceType to route to getActiveRate() mock
public static CreateOrderCommand createOrderCommand(Long customerId, UUID userId, 
        BigDecimal weightKg, int extraMinutes) {
    return new CreateOrderCommand(customerId, userId, weightKg, extraMinutes, null, null, null);
    //                                                                              ^ null serviceType
}
```

### Integration Tests (Testcontainers)
```java
@SpringBootTest
@Testcontainers
class OrderControllerIT {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");
}
```

### CI Command
```bash
cd backend && ./mvnw -B -ntp verify
# Runs: Checkstyle → Compile → Unit Tests → Integration Tests → JaCoCo Coverage → Package
```

---

## Security & Access Control

| Role | Access |
|------|--------|
| `ADMIN` | All endpoints + Reports + Rates + Users + Audit Logs |
| `STAFF` | Orders, Payments, Customers, Notifications |
| Public | `GET /api/v1/orders/reference/{ref}` (limited fields only) |

```java
@PreAuthorize("hasRole('ADMIN')")        // Admin-only
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')") // Both roles
```

**JWT:** Stored in HTTP-only cookie (`access_token`). Filter: `JwtAuthenticationFilter`.

---

## Error Handling

```java
// Standard exceptions (GlobalExceptionHandler maps these to HTTP status codes)
throw new NotFoundException("Order not found: " + orderId);       // 404
throw new IllegalArgumentException("Weight must be greater than 0"); // 400
throw new IllegalStateException("Order must be PAID before release"); // 400

// HTTP Status mapping
// 200 OK, 201 Created, 400 Bad Request, 403 Forbidden, 404 Not Found, 409 Conflict
```

---

## API Contract

**Source of truth:** `docs/05-tech-design/openapi.yaml`  
**Base URL:** `/api/v1`

Key rules:
- Match endpoint paths, methods, and parameter names exactly
- Use DTO field names as defined in OpenAPI schemas
- Run `npm run generate:types` in frontend after any OpenAPI changes

---

## Flyway Migrations

- **Location:** `backend/src/main/resources/db/migration`
- **Naming:** `V1__init.sql`, `V2__seed_users.sql`, `V3__description.sql`
- **NEVER** edit an existing migration after it has been committed
- Seed users gated by `SPRING_PROFILES_ACTIVE=dev` and env variables (see `docs/development-credentials.md`)

---

## Development Checklist (Before PR)

- [ ] Entities match `docs/04-data-design/erd.dbml` exactly
- [ ] All business rules (BR-*) enforced in service layer
- [ ] Controllers are thin (< 10 lines per method, no logic)
- [ ] DTOs used — no entity objects in controller return types
- [ ] Bean validation annotations applied (`@Valid`, `@NotNull`, etc.)
- [ ] `OrderMapper` still has `disableBuilder = true`
- [ ] Unit tests cover all business rule branches
- [ ] Integration tests use Testcontainers (no DB mocking)
- [ ] APIs match OpenAPI contract (path, method, params, status codes)
- [ ] Error handling consistent with `GlobalExceptionHandler`
- [ ] No hardcoded pricing values (use `service_rates` table)
- [ ] Flyway migrations tested clean
- [ ] `./mvnw -B -ntp verify` passes locally ✅
