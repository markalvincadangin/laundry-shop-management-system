# Getting Started — Faith Laundry Shop Management System
## Implementation Guide for Developers & AI Assistants

> **Client:** Faith Laundry Shop  
> **Prepared By:** HIMÓTECH  
> **Document ID:** GUIDE-001  
> **Version:** 1.0  
> **Date:** 2026-02-10  
> **Purpose:** Step-by-step guide to start implementing using the instruction files  
> **Status:** Active Development Guide

---

## Document Control
- **Document Type:** Developer Guide
- **Related Documents:** [Implementation Status](06-implementation/implementation-status.md), [User Stories](02-requirements/user-stories.md), [Business Rules](02-requirements/business-rules.md)
- **Confidentiality:** Internal / Academic Use

---

## Overview

This guide shows you how to leverage the instruction files (`.github/copilot-instructions.md` and `.github/instructions/*.md`) to build the Faith Laundry Shop Management System efficiently and correctly.

---

## Instruction Files Purpose

### 1. Main Copilot Instructions
**File:** `.github/copilot-instructions.md`

**Use this for:**
- Understanding the **entire project context** (client, problems, solution)
- Finding the **source of truth** (which docs to check for what)
- Checking **business rules** (pricing, status transitions, payments)
- Understanding **MVP scope** (what's in vs out)
- **Non-hallucination rules** (what NOT to invent)

**When to reference:**
- Before starting ANY feature
- When unsure about a business rule
- When deciding if a feature is in MVP scope
- During code review to validate alignment

### 2. Backend Instructions
**File:** `.github/instructions/backend.instructions.md`

**Use this for:**
- **Architecture patterns** (Controller → Service → Repository)
- **Entity definitions** (exact field names, types, constraints)
- **Business rule code examples** (pricing calculations, validations)
- **Testing patterns** (unit tests, integration tests with Testcontainers)
- **API alignment** (how to match OpenAPI spec)

**When to reference:**
- When creating a new entity class
- When implementing service layer logic
- When writing tests
- When setting up Flyway migrations
- When implementing security/RBAC

### 3. Frontend Instructions
**File:** `.github/instructions/frontend.instructions.md`

**Use this for:**
- **App Router structure** (folder organization)
- **TypeScript types** (matching OpenAPI schemas)
- **API client patterns** (centralized fetch logic)
- **UI component examples** (forms, tracking page, reports)
- **Critical rule:** NO client-side business logic

**When to reference:**
- When creating a new page/route
- When building forms
- When integrating with backend APIs
- When implementing role-based UI
- When styling with Tailwind CSS

---

## Step-by-Step: Starting Implementation

### Phase 0: Setup & Familiarization

#### Step 1: Read Documentation Hierarchy (15 minutes)
```bash
# Read in this order:
1. docs/00-context/case-study.md           # Understand the client's problems
2. docs/02-requirements/user-stories.md    # Know what features to build
3. docs/02-requirements/business-rules.md  # Learn the business constraints
4. docs/04-data-design/erd.dbml           # Study the database schema
5. docs/05-tech-design/architecture.md    # Understand system design
6. docs/06-implementation/implementation-status.md  # Implementation vs requirements gap
```

#### Step 2: Bookmark Instruction Files
Keep these open in your IDE or browser:
- `.github/copilot-instructions.md` - Main reference
- `.github/instructions/backend.instructions.md` - For backend work
- `.github/instructions/frontend.instructions.md` - For frontend work

#### Step 3: Set Up Environment

```bash
# 1. Configure environment
cp .env.example .env

# 2. Start ONLY the database in Docker
docker compose up -d db

# 3. Start Backend natively (Terminal 1)
# Export .env variables to your Linux shell first
export $(grep -v '^#' .env | xargs) && cd backend && ./mvnw spring-boot:run

# 4. Start Frontend natively (Terminal 2)
cd frontend
cp .env.local.example .env.local
# Ensure .env.local points to the native backend port: NEXT_PUBLIC_API_URL=http://localhost:8080/api
npm run dev
```
> **Note:** Alternatively, to run the entire stack in Docker without native dependencies, simply use `docker compose --profile full up -d`.

---

### Phase 1: Backend Implementation

#### Example: Implementing Order Creation (US-01, US-02)

**Step 1: Check the Requirements**
```markdown
📖 Open: docs/02-requirements/user-stories.md
→ Find: US-01 (Record Laundry Order)
→ Find: US-02 (Automatically Compute Laundry Price)

📖 Open: docs/02-requirements/business-rules.md
→ Find: BR-PR-01 (Base Load Pricing)
→ Find: BR-PR-02 (Load Calculation)
→ Find: BR-PR-03 (Extra Washing Time)
→ Find: BR-OL-01 (Unique Reference Number)
→ Find: BR-OL-02 (Initial Status)
```

**Step 2: Check Data Model**
```markdown
📖 Open: docs/04-data-design/erd.dbml
→ Find: Table `orders` definition
→ Note all fields: reference_number, weight_kg, total_loads, etc.
→ Note: Pricing snapshot fields (base_price_per_load, kg_limit_per_load, price_per_extra_minute)
```

**Step 3: Use Backend Instructions**
```markdown
📖 Open: .github/instructions/backend.instructions.md
→ Section: "Data Model & Schema Rules" → Orders entity
→ Section: "Business Rules Implementation (BR-*)" → Pricing Rules
→ Copy code example for load calculation:
```

```java
// From backend.instructions.md (BR-PR-02)
int totalLoads = (int) Math.ceil(
    weightKg.divide(kgLimitPerLoad, 10, RoundingMode.HALF_UP).doubleValue()
);
```

**Step 4: Implement Entity**
```java
// backend/src/main/java/com/himotech/laundryms/orders/Order.java
// Reference: backend.instructions.md → "Orders" entity definition

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String referenceNumber;  // BR-OL-01
    
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal weightKg;  // BR-PR-01
    
    @Column(nullable = false)
    private Integer totalLoads;  // BR-PR-02 (computed)
    
    // Pricing snapshots (from active service rate)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePricePerLoad;
    
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal kgLimitPerLoad;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerExtraMinute;
    
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer extraMinutes;  // BR-PR-03
    
    // Computed amounts
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseAmount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal extraMinutesAmount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal addonsTotalAmount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus currentStatus = OrderStatus.RECEIVED;  // BR-OL-02
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    
    // ...timestamps, getters, setters
}
```

**Step 5: Implement Service**
```java
// backend/src/main/java/com/himotech/laundryms/orders/OrderService.java
// Reference: backend.instructions.md → "OrderService" section

@Service
@Slf4j
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ServiceRateRepository serviceRateRepository;
    
    public OrderResponseDTO createOrder(CreateOrderRequestDTO request) {
        log.info("Creating order for customer: {}, weight: {}kg", 
            request.getCustomerId(), request.getWeightKg());
        
        // 1. Load active service rate
        ServiceRate activeRate = serviceRateRepository.findByIsActiveTrue()
            .orElseThrow(() -> new IllegalStateException("No active service rate found"));
        
        // 2. Compute loads (BR-PR-02)
        // Reference: backend.instructions.md → BR-PR-02
        int totalLoads = (int) Math.ceil(
            request.getWeightKg()
                .divide(activeRate.getKgLimitPerLoad(), 10, RoundingMode.HALF_UP)
                .doubleValue()
        );
        
        // 3. Compute amounts (BR-PR-01, BR-PR-03)
        BigDecimal baseAmount = activeRate.getBasePricePerLoad()
            .multiply(BigDecimal.valueOf(totalLoads));
        
        BigDecimal extraMinutesAmount = BigDecimal.valueOf(request.getExtraMinutes())
            .multiply(activeRate.getPricePerExtraMinute());
        
        BigDecimal addonsTotalAmount = computeAddOnsTotal(request.getAddOns());
        
        BigDecimal grandTotal = baseAmount
            .add(extraMinutesAmount)
            .add(addonsTotalAmount);
        
        // 4. Generate unique reference (BR-OL-01)
        String referenceNumber = generateUniqueReference();
        
        // 5. Create order entity
        Order order = new Order();
        order.setReferenceNumber(referenceNumber);
        order.setCustomer(findCustomer(request.getCustomerId()));
        order.setWeightKg(request.getWeightKg());
        order.setTotalLoads(totalLoads);
        
        // Snapshot pricing (for historical accuracy)
        order.setBasePricePerLoad(activeRate.getBasePricePerLoad());
        order.setKgLimitPerLoad(activeRate.getKgLimitPerLoad());
        order.setPricePerExtraMinute(activeRate.getPricePerExtraMinute());
        
        order.setExtraMinutes(request.getExtraMinutes());
        order.setBaseAmount(baseAmount);
        order.setExtraMinutesAmount(extraMinutesAmount);
        order.setAddonsTotalAmount(addonsTotalAmount);
        order.setGrandTotal(grandTotal);
        
        // Initial status (BR-OL-02)
        order.setCurrentStatus(OrderStatus.RECEIVED);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        
        // 6. Save
        order = orderRepository.save(order);
        
        log.info("Order created successfully. Reference: {}, Total: ₱{}", 
            order.getReferenceNumber(), order.getGrandTotal());
        
        return orderMapper.toDTO(order);
    }
    
    // Helper methods...
}
```

**Step 6: Write Tests**
```java
// Reference: backend.instructions.md → "Testing Standards" section

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private ServiceRateRepository serviceRateRepository;
    
    @InjectMocks
    private OrderService orderService;
    
    @Test
    void shouldComputeCorrectTotalLoads_For8Point1Kg() {
        // Test: ceil(8.1 / 8) = 2 loads
        // Reference: BR-PR-02
        
        // Given
        ServiceRate rate = new ServiceRate();
        rate.setKgLimitPerLoad(new BigDecimal("8.00"));
        when(serviceRateRepository.findByIsActiveTrue())
            .thenReturn(Optional.of(rate));
        
        CreateOrderRequestDTO request = new CreateOrderRequestDTO();
        request.setWeightKg(new BigDecimal("8.1"));
        
        // When
        OrderResponseDTO result = orderService.createOrder(request);
        
        // Then
        assertThat(result.getTotalLoads()).isEqualTo(2);
    }
    
    @Test
    void shouldComputeCorrectGrandTotal() {
        // Test: base + extra_minutes + addons = grand_total
        // Reference: backend.instructions.md → "Grand Total Computation"
        
        // Given
        ServiceRate rate = new ServiceRate();
        rate.setBasePricePerLoad(new BigDecimal("120.00"));
        rate.setKgLimitPerLoad(new BigDecimal("8.00"));
        rate.setPricePerExtraMinute(new BigDecimal("1.00"));
        
        CreateOrderRequestDTO request = new CreateOrderRequestDTO();
        request.setWeightKg(new BigDecimal("8.0"));  // 1 load
        request.setExtraMinutes(10);  // ₱10
        // No add-ons
        
        // When
        OrderResponseDTO result = orderService.createOrder(request);
        
        // Then
        // base: 1 load × ₱120 = ₱120
        // extra: 10 min × ₱1 = ₱10
        // grand: ₱120 + ₱10 = ₱130
        assertThat(result.getGrandTotal()).isEqualByComparingTo("130.00");
    }
}
```

---

### Phase 2: Frontend Implementation

#### Example: Building Order Creation Form (US-01, US-02)

**Step 1: Check Frontend Instructions**
```markdown
📖 Open: .github/instructions/frontend.instructions.md
→ Section: "Order Creation Form (US-01, US-02)"
→ Copy the component structure example
→ Note: "NEVER hardcode pricing calculations"
```

**Step 2: Create TypeScript Types**
```typescript
// frontend/lib/api/types.ts
// Reference: frontend.instructions.md → "TypeScript Types"

export interface CreateOrderRequest {
  customerId: number;
  weightKg: number;
  extraMinutes?: number;
  addOns?: OrderAddOnRequest[];
}

export interface OrderAddOnRequest {
  name: string;
  price: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  referenceNumber: string;
  weightKg: number;
  totalLoads: number;          // ✅ From backend, not computed here!
  baseAmount: number;           // ✅ From backend
  extraMinutesAmount: number;   // ✅ From backend
  grandTotal: number;           // ✅ From backend
  currentStatus: OrderStatus;
  // ...other fields
}

export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  WASHING = 'WASHING',
  DRYING = 'DRYING',
  FOLDING = 'FOLDING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED',
}
```

**Step 3: Create API Client**
```typescript
// frontend/lib/api/orders.ts
// Reference: frontend.instructions.md → "API Integration"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }
    
    return response.json();
  },
};
```

**Step 4: Build Form Component**
```typescript
// frontend/app/(dashboard)/orders/new/page.tsx
// Reference: frontend.instructions.md → "Order Creation Form"

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';

export default function NewOrderPage() {
  const router = useRouter();
  const [weightKg, setWeightKg] = useState('');
  const [extraMinutes, setExtraMinutes] = useState('0');
  const [preview, setPreview] = useState<OrderResponse | null>(null);
  
  const handlePreview = async () => {
    const data: CreateOrderRequest = {
      customerId: selectedCustomerId,
      weightKg: parseFloat(weightKg),
      extraMinutes: parseInt(extraMinutes),
    };
    
    // ✅ CORRECT: Let backend compute everything
    const previewOrder = await ordersApi.preview(data);
    setPreview(previewOrder);
  };
  
  const handleSubmit = async () => {
    try {
      const order = await ordersApi.create({
        customerId: selectedCustomerId,
        weightKg: parseFloat(weightKg),
        extraMinutes: parseInt(extraMinutes),
      });
      
      // ✅ Display totals from API response
      toast.success(`Order created! Total: ₱${order.grandTotal}`);
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Laundry Order</h1>
      
      {/* Weight Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Weight (kg)
        </label>
        <input
          type="number"
          step="0.1"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      {/* Extra Minutes */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Extra Minutes (optional)
        </label>
        <input
          type="number"
          value={extraMinutes}
          onChange={(e) => setExtraMinutes(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          First 45 minutes per load included. ₱1 per extra minute.
        </p>
      </div>
      
      {/* Preview (from backend) */}
      {preview && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Loads:</span>
              {/* ✅ From backend, not computed here */}
              <span>{preview.totalLoads}</span>
            </div>
            <div className="flex justify-between">
              <span>Base Amount:</span>
              {/* ✅ From backend */}
              <span>₱{preview.baseAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Grand Total:</span>
              {/* ✅ From backend */}
              <span>₱{preview.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Preview Totals
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Order
        </button>
      </div>
    </div>
  );
}
```

---

## Using GitHub Copilot Effectively

### Method 1: Reference in Comments
```java
// Implement BR-PR-02: Load calculation using ceil(weight_kg / kg_limit_per_load)
// Reference: .github/instructions/backend.instructions.md

public int computeTotalLoads(BigDecimal weightKg, BigDecimal kgLimit) {
    // Copilot will suggest code based on instructions
}
```

### Method 2: Ask Copilot Chat
```
@workspace Implement order creation service following the OrderService 
specification in backend.instructions.md. Ensure BR-PR-01, BR-PR-02, 
BR-PR-03, BR-OL-01, and BR-OL-02 are enforced.
```

### Method 3: Use Inline Chat
1. Select the `OrderService` interface
2. Press `Ctrl+I` (inline chat)
3. Type: "Implement this following backend.instructions.md business rules"

---

## Validation Checklist

Before submitting PR, use the checklists from instruction files:

### Backend Checklist
From `.github/instructions/backend.instructions.md`:
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

### Frontend Checklist
From `.github/instructions/frontend.instructions.md`:
- [ ] No hardcoded business logic (pricing, validation)
- [ ] All API calls use centralized client module
- [ ] Types match OpenAPI schemas exactly
- [ ] Error handling uses backend `ErrorResponse`
- [ ] Public tracking page exposes only allowed fields
- [ ] Mobile-responsive design
- [ ] Tailwind CSS used consistently
- [ ] Role-based access control implemented
- [ ] Forms use validation (React Hook Form + Zod)
- [ ] Loading states and error states handled
- [ ] Environment variables properly configured
- [ ] `npm run build` succeeds

---

## Quick Reference Card

### When implementing a feature:

1. **Find the User Story** → `docs/02-requirements/user-stories.md`
2. **Check Business Rules** → `docs/02-requirements/business-rules.md`
3. **Check Data Model** → `docs/04-data-design/erd.dbml`
4. **Check API Contract** → `docs/05-tech-design/openapi.yaml`
5. **Use Code Examples** → `.github/instructions/backend.instructions.md` or `frontend.instructions.md`
6. **Validate Against Checklist** → Same instruction files

### When stuck or unsure:

1. **Check copilot-instructions.md** → "Non-Hallucination Rules" section
2. **Check MVP Scope** → copilot-instructions.md → "MVP Scope Boundaries"
3. **Ask in comments:** `// Question: Is this feature in MVP scope? Check copilot-instructions.md`

---

## Common Patterns

### ✅ DO: Follow the Instructions
```java
// ✅ Correct: Using exact formula from backend.instructions.md (BR-PR-02)
int totalLoads = (int) Math.ceil(
    weightKg.divide(kgLimitPerLoad, 10, RoundingMode.HALF_UP).doubleValue()
);
```

### ❌ DON'T: Invent Your Own Logic
```java
// ❌ Wrong: Making up a different calculation
int totalLoads = (int) (weightKg / kgLimitPerLoad) + 1;  // Don't do this!
```

### ✅ DO: Use Backend Data
```typescript
// ✅ Correct: Display totals from API
<span>₱{order.grandTotal.toFixed(2)}</span>
```

### ❌ DON'T: Compute on Frontend
```typescript
// ❌ Wrong: Computing on frontend
const grandTotal = totalLoads * 120 + extraMinutes;  // Don't do this!
```

---

## Next Steps

1. ✅ Read this guide completely
2. ✅ Bookmark the instruction files
3. ✅ Set up your development environment
4. ✅ Start with Phase 1 from the requirements (user-stories.md, business-rules.md)
5. ✅ Reference instruction files for every feature
6. ✅ Use validation checklists before submitting PRs

---

## Support & Questions

If you're unsure about something:
1. Check the relevant instruction file first
2. Cross-reference with documentation in `/docs`
3. Look for similar examples in instruction files
4. Ask specific questions with document references

**Good Question:**
> "According to BR-PR-03 in business-rules.md, extra minutes are charged at ₱1 per minute. 
> Should this be stored in service_rates table or hardcoded?"

**Answer in copilot-instructions.md:**
> "No hardcoded values (use service_rates table)"

---

## Summary

The instruction files are your **implementation playbook**:
- **copilot-instructions.md** = What to build and why
- **backend.instructions.md** = How to build backend (with code)
- **frontend.instructions.md** = How to build frontend (with code)

**Golden Rule:** When in doubt, check the instructions. They contain the answers.

Happy coding! 🚀

