---
applyTo: "frontend/**"
---

# Frontend Instructions — Next.js 14+
## Faith Laundry Shop Management System

> **Context:** Web-based UI for laundry order management with staff/owner workflows and public order tracking  
> **Stack:** Next.js 14+, React, TypeScript, Tailwind CSS

---

## Tech Stack (Mandatory)

- **Next.js 14+** - Framework (App Router)
- **React 18+** - UI library
- **TypeScript** - Language (strict mode)
- **Tailwind CSS** - Styling
- **React Hook Form** – Form management (recommended)
- **Zod** - Schema validation (recommended)

---

## Architecture Principles

### App Router Structure
Use **Next.js App Router** (not Pages Router)

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (dashboard)/
│   ├── orders/
│   │   ├── page.tsx              # Order list
│   │   ├── new/
│   │   │   └── page.tsx          # Create order (US-01, US-02)
│   │   └── [id]/
│   │       └── page.tsx          # Order detail (US-03, US-05)
│   ├── customers/
│   │   ├── page.tsx              # Customer list
│   │   └── new/
│   │       └── page.tsx          # Create customer
│   ├── payments/
│   │   └── page.tsx              # Payment recording (US-06)
│   └── reports/                  # Owner-only (US-08, US-09)
│       ├── daily/
│       │   └── page.tsx
│       ├── monthly/
│       │   └── page.tsx
│       └── yearly/
│           └── page.tsx
├── track/
│   └── page.tsx                  # Public tracking (US-04)
└── api/                          # Optional: API routes for server actions
```

### Component Organization
```
components/
├── ui/                           # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Table.tsx
├── forms/                        # Form components
│   ├── OrderForm.tsx
│   ├── CustomerForm.tsx
│   └── PaymentForm.tsx
├── orders/                       # Order-specific
│   ├── OrderList.tsx
│   ├── OrderCard.tsx
│   ├── OrderStatusBadge.tsx
│   └── OrderStatusTimeline.tsx
└── reports/                      # Report components
    ├── DailyReportChart.tsx
    └── ReportSummary.tsx
```

---

## API Integration

### API Client Module
**Location:** `lib/api/` or `services/`

**Rules:**
- Single source for all API calls
- Type-safe using TypeScript interfaces
- Handle errors consistently
- Use environment variable: `NEXT_PUBLIC_API_URL`

**Example:**
```typescript
// lib/api/orders.ts
import { CreateOrderRequest, OrderResponse } from './types';

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
  
  getByReference: async (referenceNumber: string): Promise<OrderResponse> => {
    const response = await fetch(`${API_URL}/api/orders/track/${referenceNumber}`);
    
    if (!response.ok) {
      throw new ApiError('Order not found', response.status);
    }
    
    return response.json();
  },
  
  updateStatus: async (orderId: number, newStatus: string): Promise<OrderResponse> => {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ newStatus }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }
    
    return response.json();
  },
};
```

### TypeScript Types
**Source:** `/docs/05-tech-design/openapi.yaml`

**Rules:**
- Define types matching OpenAPI schemas
- Use exact field names
- Do NOT add fields not in OpenAPI

**Example:**
```typescript
// lib/api/types.ts

// Request DTOs
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

export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus;
  notes?: string;
}

export interface CreatePaymentRequest {
  orderId: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  remarks?: string;
}

// Response DTOs
export interface OrderResponse {
  id: number;
  referenceNumber: string;
  customer: CustomerSummary;
  weightKg: number;
  totalLoads: number;
  extraMinutes: number;
  baseAmount: number;
  extraMinutesAmount: number;
  addonsTotal: number;
  grandTotal: number;
  currentStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary {
  id: number;
  firstName: string;
  lastName: string;
  contactNumber: string;
}

// Enums (match backend exactly)
export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  WASHING = 'WASHING',
  DRYING = 'DRYING',
  FOLDING = 'FOLDING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
}

export enum PaymentMethod {
  CASH = 'CASH',
  GCASH = 'GCASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// Error response
export interface ErrorResponse {
  message: string;
  timestamp: string;
  path: string;
}
```

### Error Handling
```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public path?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
```

---

## Business Logic Rules (Critical)

### NO Client-Side Business Logic

**NEVER implement these on the frontend:**
- ❌ Pricing calculations (load computation, totals)
- ❌ Status transition validation
- ❌ Payment amount validation
- ❌ Business rule enforcement

**ALWAYS use backend API:**
- ✅ Display totals from API response
- ✅ Show allowed status transitions from API
- ✅ Validate forms using API error responses
- ✅ Trust backend for all computations

**Example (CORRECT):**
```typescript
// ✅ Good: Let backend compute totals
const handleCreateOrder = async (data: CreateOrderRequest) => {
  try {
    const order = await ordersApi.create(data); // Backend computes everything
    toast.success(`Order created! Total: ₱${order.grandTotal}`);
    router.push(`/orders/${order.id}`);
  } catch (error) {
    toast.error(handleApiError(error));
  }
};
```

**Example (WRONG):**
```typescript
// ❌ Bad: Computing totals on frontend
const totalLoads = Math.ceil(weightKg / 8); // DON'T DO THIS
const baseAmount = totalLoads * 120; // DON'T DO THIS
const grandTotal = baseAmount + extraMinutesAmount; // DON'T DO THIS
```

---

## User Interface Implementation

### Order Creation Form (US-01, US-02)

**Requirements:**
- Customer selection (existing or new)
- Weight input (kg, required, > 0)
- Extra minutes input (optional, >= 0)
- Add-ons (optional, dynamic list)
- Display computed totals from the backend before saving

**Example:**
```typescript
// app/(dashboard)/orders/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ordersApi } from '@/lib/api/orders';

const orderSchema = z.object({
  customerId: z.number().positive('Customer is required'),
  weightKg: z.number().positive('Weight must be greater than 0'),
  extraMinutes: z.number().min(0, 'Extra minutes cannot be negative').optional(),
  addOns: z.array(z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().positive(),
  })).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<OrderResponse | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });
  
  const onPreview = async (data: OrderFormData) => {
    // Call API to compute totals (preview mode)
    const previewOrder = await ordersApi.preview(data);
    setPreview(previewOrder);
  };
  
  const onSubmit = async (data: OrderFormData) => {
    try {
      const order = await ordersApi.create(data);
      toast.success(`Order ${order.referenceNumber} created successfully!`);
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Laundry Order</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Customer</label>
          <CustomerSelect {...register('customerId')} />
          {errors.customerId && (
            <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>
          )}
        </div>
        
        {/* Weight input */}
        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            {...register('weightKg', { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.weightKg && (
            <p className="text-red-500 text-sm mt-1">{errors.weightKg.message}</p>
          )}
        </div>
        
        {/* Extra minutes input */}
        <div>
          <label className="block text-sm font-medium mb-2">Extra Minutes (optional)</label>
          <input
            type="number"
            {...register('extraMinutes', { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            First 45 minutes per load included. ₱1 per extra minute.
          </p>
        </div>
        
        {/* Preview totals */}
        {preview && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Loads:</span>
                <span>{preview.totalLoads}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Amount:</span>
                <span>₱{preview.baseAmount.toFixed(2)}</span>
              </div>
              {preview.extraMinutesAmount > 0 && (
                <div className="flex justify-between">
                  <span>Extra Minutes:</span>
                  <span>₱{preview.extraMinutesAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Grand Total:</span>
                <span>₱{preview.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit(onPreview)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Preview Totals
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Order
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Order Status Update (US-03)

**Requirements:**
- Display current status
- Allow status transitions (backend validates)
- Record status changes with timestamp
- Show status history timeline

**Status Badge Component:**
```typescript
// components/orders/OrderStatusBadge.tsx
import { OrderStatus } from '@/lib/api/types';

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]: 'bg-gray-200 text-gray-800',
  [OrderStatus.WASHING]: 'bg-blue-200 text-blue-800',
  [OrderStatus.DRYING]: 'bg-yellow-200 text-yellow-800',
  [OrderStatus.FOLDING]: 'bg-purple-200 text-purple-800',
  [OrderStatus.READY_FOR_PICKUP]: 'bg-green-200 text-green-800',
  [OrderStatus.RELEASED]: 'bg-green-600 text-white',
  [OrderStatus.CANCELLED]: 'bg-red-200 text-red-800',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
```

### Public Order Tracking (US-04)

**Requirements:**
- Customer can enter a reference number
- Display order status and basic info
- **NEVER expose:** internal IDs, staff info, customer full details

**Example:**
```typescript
// app/track/page.tsx
'use client';

import { useState } from 'react';
import { ordersApi } from '@/lib/api/orders';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

export default function TrackOrderPage() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const result = await ordersApi.getByReference(referenceNumber);
      setOrder(result);
    } catch (err) {
      setError('Order not found. Please check your reference number.');
      setOrder(null);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>
      
      <form onSubmit={handleTrack} className="mb-6">
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Enter reference number (e.g., LDR-20260210-001)"
          className="w-full border rounded px-4 py-2 mb-3"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Track Order
        </button>
      </form>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {order && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-semibold text-lg">{order.referenceNumber}</h2>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <OrderStatusBadge status={order.currentStatus} />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Weight:</span>
              <span className="font-medium">{order.weightKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">₱{order.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`font-medium ${
                order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Payment Recording (US-06)

**Requirements:**
- Link payment to order
- Amount must match order total (backend validates)
- Select a payment method
- Display payment confirmation

**Example:**
```typescript
// components/forms/PaymentForm.tsx
interface PaymentFormProps {
  order: OrderResponse;
  onSuccess: () => void;
}

export function PaymentForm({ order, onSuccess }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [remarks, setRemarks] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await paymentsApi.create({
        orderId: order.id,
        amountPaid: order.grandTotal, // Must match exactly
        paymentMethod,
        remarks,
      });
      
      toast.success('Payment recorded successfully');
      onSuccess();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Amount to Pay:</span>
          <span className="text-2xl font-bold text-blue-600">
            ₱{order.grandTotal.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          className="w-full border rounded px-3 py-2"
        >
          <option value={PaymentMethod.CASH}>Cash</option>
          <option value={PaymentMethod.GCASH}>GCash</option>
          <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Remarks (optional)</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Record Payment
      </button>
    </form>
  );
}
```

### Reports (US-08, US-09)

**Requirements:**
- Owner-only access
- Daily/monthly/yearly views
- Display total income and order count
- Data from backend aggregation

**Example:**
```typescript
// app/(dashboard)/reports/daily/page.tsx
'use client';

import { useState } from 'react';
import { reportsApi } from '@/lib/api/reports';

export default function DailyReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  
  const loadReport = async () => {
    const data = await reportsApi.getDaily(date);
    setReport(data);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Daily Sales Report</h1>
      
      <div className="mb-6 flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={loadReport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load Report
        </button>
      </div>
      
      {report && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-sm text-gray-500 mb-2">Total Income</h3>
            <p className="text-3xl font-bold text-green-600">
              ₱{report.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-sm text-gray-500 mb-2">Orders Completed</h3>
            <p className="text-3xl font-bold text-blue-600">
              {report.orderCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Styling Standards

### Tailwind CSS Usage

**Rules:**
- Use Tailwind utility classes
- Avoid inline styles unless absolutely necessary
- Use consistent spacing scale (4, 6, 8, 12, 16, 24)
- Mobile-responsive by default

**Color Palette:**
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  },
};
```

**Responsive Design:**
```tsx
<div className="px-4 md:px-6 lg:px-8"> {/* Responsive padding */}
  <h1 className="text-xl md:text-2xl lg:text-3xl"> {/* Responsive text */}
    Title
  </h1>
</div>
```

---

## Security & Access Control

### Role-Based UI

```typescript
// lib/auth/useAuth.ts
export function useAuth() {
  const user = useUser(); // Get from auth context
  
  return {
    user,
    isOwner: user?.role === 'OWNER',
    isStaff: user?.role === 'STAFF',
    can: (permission: string) => {
      // Check permissions
    },
  };
}

// Usage in components
function ReportsLink() {
  const { isOwner } = useAuth();
  
  if (!isOwner) return null; // Hide from staff
  
  return <Link href="/reports">Reports</Link>;
}
```

### Protected Routes

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role for /reports routes
  if (request.nextUrl.pathname.startsWith('/reports')) {
    const userRole = getUserRole(token); // Decode JWT
    if (userRole !== 'OWNER') {
      return NextResponse.redirect(new URL('/orders', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Environment Configuration

### .env.local
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false
```

### Environment Usage
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Only use NEXT_PUBLIC_ prefix for client-side variables
```

---

## Development Checklist

Before submitting PR:
- [ ] No hardcoded business logic (pricing, validation)
- [ ] All API calls use a centralized client module
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
